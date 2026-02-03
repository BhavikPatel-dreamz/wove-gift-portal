// app/api/voucher/generate-pdf/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { jsPDF } from 'jspdf';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        brand: true,
        occasion: true,
        voucherCodes: {
          include: {
            giftCard: true,
            voucher: true,
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

    if (order.deliveryMethod !== 'print') {
      return NextResponse.json(
        { error: 'This order is not configured for print delivery' },
        { status: 400 }
      );
    }

    // Generate PDF directly with jsPDF (no HTML2Canvas)
    const pdfBuffer = await generatePDF(order);

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

async function generatePDF(order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [85, 120] // Business card size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Helper function to center text
  const centerText = (text, y, fontSize = 11, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
    return { x, y };
  };

  // Occasion line
  const occasionName = order.occasion?.name || 'Gift Card';
  const occasionText = `${occasionName} - Gift Items`;
  centerText(occasionText, 12, 9, true);

  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(10, 18, pageWidth - 10, 18);

  // Brand name
  const brandName = order.brand?.brandName || 'HUX';
  centerText(brandName, 28, 16, true);

  // Subtitle
  const subtitle = order.brand?.subtitle || 
                   (order.brand?.brandName ? `${order.brand.brandName}lee Fashion` : 'Huxlee Fashion');
  centerText(subtitle, 34, 9, false);

  // Amount
  const currencySymbol = getCurrencySymbol(order.currency);
  const amountText = `${currencySymbol} ${order.amount}`;
  centerText(amountText, 50, 18, true);

  // Currency code (smaller, beside amount)
  // doc.setFontSize(11);
  // doc.setFont('helvetica', 'normal');
  // doc.setTextColor(120, 120, 120);
  // doc.text(order.currency, pageWidth / 2 + 15, 50);

  // Personal message if exists
  let currentY = 62;
  if (order.message) {
    centerText('PERSONAL MESSAGE', currentY, 7, true);
    currentY += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 60, 60);
    
    const message = `"${order.message}"`;
    const maxWidth = pageWidth - 20;
    const messageLines = doc.splitTextToSize(message, maxWidth);
    
    for (let i = 0; i < Math.min(messageLines.length, 2); i++) {
      doc.text(messageLines[i], pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;
    }
    currentY += 4;
  }

  // Voucher code section
  centerText('VOUCHER CODE', currentY, 7, true);
  currentY += 6;

  // Voucher code box
  const voucherCode = order.voucherCodes[0];
  // console.log("voucherCode",voucherCode)
  const actualCode = voucherCode?.giftCard?.code || voucherCode?.code || 'XXXX-XXXX-XXXX';
  const formattedCode =  actualCode;
  
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, currentY, pageWidth - 30, 10, 2, 2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, currentY, pageWidth - 30, 10, 2, 2, 'S');
  
  doc.setFontSize(11);
  doc.setFont('courier', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(formattedCode, pageWidth / 2, currentY + 6, { align: 'center' });
  currentY += 16;

  // Validity text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const validityText = getValidityText(order);
  doc.text(validityText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Add a subtle border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');

  return doc.output('arraybuffer');
}

// Helper functions
function getCurrencySymbol(currency) {
  const symbols = {
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': '$',
    'CAD': '$',
    'JPY': '¥',
    'INR': '₹',
  };
  return symbols[currency?.toUpperCase()] || '$';
}

function formatVoucherCode(code) {
  if (!code || code === 'XXXX-XXXX-XXXX') return 'XXXX-XXXX-XXXX';
  
  const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '');
  
  if (cleanCode.length >= 12) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}-${cleanCode.substring(8, 12)}`.toUpperCase();
  }
  
  return cleanCode.toUpperCase();
}

function getValidityText(order) {
  const voucherCode = order.voucherCodes[0];
  
  if (voucherCode?.giftCard?.expiresAt) {
    const date = new Date(voucherCode.giftCard.expiresAt);
    return `Valid until ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  }
  
  if (voucherCode?.voucher?.expiryValue) {
    return `Valid for ${voucherCode.voucher.expiryValue} days`;
  }
  
  return 'Valid for 365 days';
}