// components/GiftCardPDF.jsx
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf'
// });

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f5f5f5',
    padding: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 340,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  
  // Top Image Section
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  giftImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #ED457D 0%, #FA8F42 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  occasionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  occasionText: {
    fontSize: 9,
    fontWeight: 600,
    color: '#1a1a1a',
  },
  emojiLarge: {
    fontSize: 60,
  },
  
  // Content Section
  contentContainer: {
    padding: 20,
  },
  
  // Brand Section
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottom: '1px solid #e5e7eb',
    marginBottom: 16,
  },
  brandLogoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandLogo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  brandInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  brandCategory: {
    fontSize: 10,
    color: '#6b7280',
  },
  
  // Amount Section
  amountContainer: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333ea',
    marginRight: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // Personal Message Section
  messageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 11,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  
  // Voucher Code Section
  voucherContainer: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
  },
  voucherLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  voucherCode: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Courier',
    letterSpacing: 2,
    color: '#111827',
  },
  
  // Footer Section
  footer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 1.6,
  },
});

const GiftCardPDF = ({ 
  recipient,
  voucherCode,
  orderData,
  selectedBrand,
  expiryDate,
  companyName,
  personalMessage 
}) => {
  const recipientName = recipient?.recipientName || "You";
  const currency = orderData?.selectedAmount?.currency || "₹";
  const amount = voucherCode?.originalValue || orderData?.selectedAmount?.value || "100";
  const giftCode = voucherCode?.code || "XXXX-XXXX-XXXX";
  const brandName = selectedBrand?.brandName || "Brand";
  
  const brandLogoUrl = selectedBrand?.logo || null;
  const giftCardImageUrl = orderData?.selectedSubCategory?.image || null;
  const occasionName = orderData?.selectedSubCategory?.name || "Gift Card";
  const occasionEmoji = orderData?.selectedSubCategory?.emoji || "🎁";
  const categoryName = selectedBrand?.categoryName || "Gift Card";

  const getCurrencySymbol = (curr) => {
    const symbols = {
      'ZAR': 'R',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥',
      'INR': '₹',
    };
    return symbols[curr?.toUpperCase()] || '$';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          
          {/* Top Image Section */}
          <View style={styles.imageContainer}>
            {giftCardImageUrl ? (
              <Image src={giftCardImageUrl} style={styles.giftImage} />
            ) : (
              <View style={styles.gradientBackground}>
                <Text style={styles.emojiLarge}>{occasionEmoji}</Text>
              </View>
            )}
            
            {/* Occasion Badge */}
            <View style={styles.occasionBadge}>
              <Text style={styles.occasionText}>{occasionName}</Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            
            {/* Brand Section */}
            <View style={styles.brandSection}>
              <View style={styles.brandLogoContainer}>
                {brandLogoUrl ? (
                  <Image src={brandLogoUrl} style={styles.brandLogo} />
                ) : (
                  <Text style={styles.brandInitial}>
                    {brandName?.charAt(0) || 'G'}
                  </Text>
                )}
              </View>
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{brandName}</Text>
                <Text style={styles.brandCategory}>{categoryName}</Text>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                {/* <Text style={styles.currencySymbol}>
                  {getCurrencySymbol(currency)}
                </Text> */}
                <Text style={styles.amount}>{amount}</Text>
                <Text style={styles.currencyCode}>{currency}</Text>
              </View>
            </View>

            {/* Personal Message Section */}
            {personalMessage && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Personal Message</Text>
                <Text style={styles.messageText}>"{personalMessage}"</Text>
              </View>
            )}

            {/* Voucher Code Section */}
            <View style={styles.voucherContainer}>
              <Text style={styles.voucherLabel}>Voucher Code</Text>
              <Text style={styles.voucherCode}>{giftCode}</Text>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{expiryDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default GiftCardPDF;