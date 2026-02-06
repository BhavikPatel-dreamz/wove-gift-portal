// app/api/voucher/generate-pdf/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { renderToStream } from '@react-pdf/renderer';
import GiftCardPDF from '../../../../components/GiftCardPDF';
import BulkGiftCardPDF from '../../../../components/BulkGiftCardPDF';

export async function POST(request) {
  try {
    const { orderId, bulk = false } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order with all necessary data
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
        bulkRecipients: true,
        receiverDetail: true,
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

    // Fetch subCategory separately if subCategoryId exists
    let subCategory = null;
    if (order.subCategoryId) {
      subCategory = await prisma.occasionCategory.findUnique({
        where: { id: order.subCategoryId },
      });
    }

    // Attach subCategory to order object
    order.subCategory = subCategory;

    let pdfBuffer;

    if (bulk && order.bulkRecipients && order.bulkRecipients.length > 0) {
      // Generate bulk PDF with multiple pages
      pdfBuffer = await generateBulkPDF(order);
    } else {
      // Generate single PDF
      pdfBuffer = await generateSinglePDF(order);
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gift-card-${order.orderNumber || orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

async function generateSinglePDF(order) {
  // Prepare data for single PDF
  const recipient = order.bulkRecipients?.[0] || {
    recipientName: order.receiverDetail?.name || 'Recipient',
    recipientEmail: order.receiverDetail?.email || '',
  };

  const voucherCodeData = order.voucherCodes?.[0] || {};
  
  // Use the giftCard code if available, otherwise fall back to VoucherCode code
  const voucherCode = {
    ...voucherCodeData,
    code: voucherCodeData?.giftCard?.code || voucherCodeData?.code || '',
  };
  
  const orderData = {
    selectedBrand: order.brand,
    selectedSubCategory: order.subCategory,
    selectedAmount: {
      value: order.amount,
      currency: order.currency,
    },
    personalMessage: order.message,
  };

  const expiryDate = getExpiryDateText(voucherCode);
  const companyName = order.senderName || 'Gift Sender';

  // Generate PDF using React PDF
  const stream = await renderToStream(
    <GiftCardPDF
      recipient={recipient}
      voucherCode={voucherCode}
      orderData={orderData}
      selectedBrand={order.brand}
      expiryDate={expiryDate}
      companyName={companyName}
      personalMessage={order.message}
    />
  );

  return await streamToBuffer(stream);
}

async function generateBulkPDF(order) {
  // Prepare data for each recipient
  const recipientsData = order.bulkRecipients.map((recipient, index) => {
    const voucherCodeData = order.voucherCodes?.[index] || {};
    
    // Use the giftCard code if available, otherwise fall back to VoucherCode code
    const voucherCode = {
      ...voucherCodeData,
      code: voucherCodeData?.giftCard?.code || voucherCodeData?.code || '',
    };
    
    const orderData = {
      selectedBrand: order.brand,
      selectedSubCategory: order.subCategory,
      selectedAmount: {
        value: voucherCode.originalValue || order.amount,
        currency: order.currency,
      },
    };

    const expiryDate = getExpiryDateText(voucherCode);
    const companyName = order.senderName || 'Gift Sender';
    const personalMessage = recipient.personalMessage || order.message;

    return {
      recipient,
      voucherCode,
      orderData,
      selectedBrand: order.brand,
      expiryDate,
      companyName,
      personalMessage,
    };
  });

  // Generate bulk PDF
  const stream = await renderToStream(
    <BulkGiftCardPDF recipients={recipientsData} />
  );

  return await streamToBuffer(stream);
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function getExpiryDateText(voucherCode) {
  if (voucherCode?.giftCard?.expiresAt) {
    const date = new Date(voucherCode.giftCard.expiresAt);
    return `Valid until ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  if (voucherCode?.voucher?.expiryValue) {
    return `Valid for ${voucherCode.voucher.expiryValue} days`;
  }

  return 'Valid for 365 days';
}