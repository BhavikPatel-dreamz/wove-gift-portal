// app/api/voucher/generate-pdf/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export async function POST(request) {
  try {
    const { orderId, orderNumber } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details with all necessary relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        brand: {
          include: {
            vouchers: true,
          },
        },
        occasion: true,
        voucherCodes: {
          include: {
            voucher: true,
            giftCard: {
              select: {
                code: true,
                balance: true,
                initialValue: true,
                expiresAt: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if delivery method is print
    if (order.deliveryMethod !== 'print') {
      return NextResponse.json(
        { error: 'This order is not configured for print delivery' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateGiftCardPDF(order);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gift-card-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generateGiftCardPDF(order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const brandColor = order.brand.color || '#ED457D';
  const gradientStart = hexToRgb(brandColor);
  const gradientEnd = hexToRgb('#FA8F42');

  // Add gradient background header
  const gradient = doc.internal.pageSize.width;
  for (let i = 0; i < 60; i++) {
    const ratio = i / 60;
    const r = Math.round(gradientStart.r + (gradientEnd.r - gradientStart.r) * ratio);
    const g = Math.round(gradientStart.g + (gradientEnd.g - gradientStart.g) * ratio);
    const b = Math.round(gradientStart.b + (gradientEnd.b - gradientStart.b) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, pageWidth, 1, 'F');
  }

  // Add brand logo if available
  if (order.brand.logo) {
    try {
      const logoData = await fetchImageAsBase64(order.brand.logo);
      doc.addImage(logoData, 'PNG', 15, 15, 30, 30);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Gift Card', pageWidth / 2, 30, { align: 'center' });

  // Brand name
  doc.setFontSize(16);
  doc.text(order.brand.brandName, pageWidth / 2, 40, { align: 'center' });

  // White content area
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 70, pageWidth - 30, 180, 5, 5, 'F');

  // Content area
  doc.setTextColor(0, 0, 0);
  
  // Occasion/Category
  if (order.occasion) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Occasion: ${order.occasion.name}`, 25, 85);
  }

  // Amount - Large and centered
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const currencySymbol = getCurrencySymbol(order.currency);
  const amountText = `${currencySymbol}${order.amount}`;
  doc.text(amountText, pageWidth / 2, 120, { align: 'center' });

  // Personal Message if available
  if (order.message) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    
    const messageLines = doc.splitTextToSize(order.message, pageWidth - 60);
    doc.text(messageLines, pageWidth / 2, 140, { align: 'center' });
  }

  // Voucher Code Section
  let yPosition = order.message ? 170 : 150;
  
  for (let i = 0; i < order.voucherCodes.length; i++) {
    const voucherCode = order.voucherCodes[i];
    const actualCode = voucherCode.giftCard?.code || voucherCode.code;

    // Voucher code box
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(25, yPosition, pageWidth - 50, 30, 3, 3, 'F');
    
    // "Voucher Code" label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('VOUCHER CODE', pageWidth / 2, yPosition + 8, { align: 'center' });
    
    // Actual code
    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(actualCode, pageWidth / 2, yPosition + 20, { align: 'center' });

    // PIN if available
    if (voucherCode.pin) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`PIN: ${voucherCode.pin}`, pageWidth / 2, yPosition + 27, { align: 'center' });
    }

    // QR Code
    if (actualCode) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(actualCode, {
          width: 200,
          margin: 1,
        });
        doc.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 20, yPosition + 35, 40, 40);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    yPosition += 85;
  }

  // Footer - Expiry and terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const expiryText = getExpiryText(order);
  doc.text(expiryText, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // Terms
  doc.setFontSize(8);
  const termsText = 'Please present this gift card at time of purchase. Keep this card safe as it cannot be replaced if lost or stolen.';
  const termsLines = doc.splitTextToSize(termsText, pageWidth - 40);
  doc.text(termsLines, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Sender info if available
  if (order.senderName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`From: ${order.senderName}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc.output('arraybuffer');
}

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 237, g: 69, b: 125 }; // Default pink
}

function getCurrencySymbol(currency) {
  const symbols = {
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };
  return symbols[currency] || currency;
}

function getExpiryText(order) {
  const voucher = order.voucherCodes[0]?.voucher;
  
  if (order.voucherCodes[0]?.expiresAt) {
    const expiryDate = new Date(order.voucherCodes[0].expiresAt);
    return `Valid until ${expiryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  }
  
  if (voucher?.expiryValue) {
    return `Valid for ${voucher.expiryValue} days from purchase`;
  }
  
  return 'No expiration date';
}

async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = blob.type || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}