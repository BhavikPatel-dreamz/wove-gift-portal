import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 11,
    color: "#4b5563",
  },
  metaGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  metaColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  text: {
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowLast: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "55%",
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  cellValue: {
    width: "45%",
    padding: 8,
    textAlign: "right",
  },
  listItem: {
    marginBottom: 3,
  },
  totalsBox: {
    marginTop: 10,
    marginLeft: "auto",
    width: "52%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  totalRowFinal: {
    flexDirection: "row",
    backgroundColor: "#fdf2f8",
  },
  totalLabel: {
    width: "58%",
    padding: 8,
  },
  totalValue: {
    width: "42%",
    padding: 8,
    textAlign: "right",
  },
  note: {
    marginTop: 18,
    fontSize: 9,
    color: "#6b7280",
  },
});

function InvoicePDF({ invoice }) {
  const {
    orderNumber,
    purchaseDate,
    customerName,
    customerEmail,
    recipientLines = [],
    itemDescription,
    quantity,
    currency,
    subtotal,
    discount,
    totalPaid,
    paymentMethod,
    company,
  } = invoice;

  const money = (amount) => `${currency}${Number(amount || 0).toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.heading}>Tax Invoice</Text>
          <Text style={styles.subheading}>
            {company.legalName} trading as {company.tradingName}
          </Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.text}>Order Number: {orderNumber}</Text>
            <Text style={styles.text}>Date of Purchase: {purchaseDate}</Text>
            <Text style={styles.text}>Payment Method: {paymentMethod}</Text>
          </View>

          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.text}>{customerName}</Text>
            <Text style={styles.text}>{customerEmail}</Text>
          </View>
        </View>

        <View style={styles.metaColumn}>
          <Text style={styles.sectionTitle}>Recipient Details</Text>
          {recipientLines.length > 0 ? (
            recipientLines.map((line, index) => (
              <Text key={`${line}-${index}`} style={styles.listItem}>
                {line}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>Not applicable</Text>
          )}
        </View>

        <View style={{ height: 16 }} />

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Item purchased</Text>
            <Text style={styles.cellValue}>{itemDescription}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Quantity</Text>
            <Text style={styles.cellValue}>{quantity}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.cellLabel}>Gift card value subtotal</Text>
            <Text style={styles.cellValue}>{money(subtotal)}</Text>
          </View>
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{money(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>-{money(discount)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabel}>Amount Paid</Text>
            <Text style={styles.totalValue}>{money(totalPaid)}</Text>
          </View>
        </View>

        <View style={{ height: 22 }} />

        <View style={styles.metaColumn}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          <Text style={styles.text}>{company.legalName}</Text>
          <Text style={styles.text}>Trading as {company.tradingName}</Text>
          <Text style={styles.text}>{company.address}</Text>
          <Text style={styles.text}>{company.email}</Text>
          <Text style={styles.text}>{company.website}</Text>
        </View>

        <Text style={styles.note}>
          This invoice was automatically generated for your Wove Gifts purchase.
        </Text>
      </Page>
    </Document>
  );
}

export default InvoicePDF;
