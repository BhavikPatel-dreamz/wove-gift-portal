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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 18,
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
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowLast: {
    flexDirection: "row",
  },
  labelCell: {
    width: "62%",
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  valueCell: {
    width: "38%",
    padding: 8,
    textAlign: "right",
  },
  footer: {
    marginTop: 18,
    fontSize: 9,
    color: "#6b7280",
  },
});

function SettlementStatementPDF({ statement }) {
  const {
    brandName,
    settlementPeriod,
    settlementBasis,
    paymentDate,
    paymentReference,
    commissionRateLabel,
    money,
    totalSalesValue,
    totalGiftCardsSold,
    commissionAmount,
    vatAmount,
    netAmountPaid,
  } = statement;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Settlement Statement</Text>
          <Text style={styles.subtitle}>{brandName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Settlement Information</Text>
          <Text style={styles.text}>Settlement Period: {settlementPeriod}</Text>
          <Text style={styles.text}>Settlement Basis: {settlementBasis}</Text>
          <Text style={styles.text}>Payment Date: {paymentDate}</Text>
          <Text style={styles.text}>
            Payment Reference: {paymentReference || "N/A"}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.labelCell}>Total Sales Value</Text>
            <Text style={styles.valueCell}>{money(totalSalesValue)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelCell}>Number of Gift Cards Sold</Text>
            <Text style={styles.valueCell}>{totalGiftCardsSold}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelCell}>
              Commission ({commissionRateLabel})
            </Text>
            <Text style={styles.valueCell}>{money(commissionAmount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelCell}>VAT on Commission</Text>
            <Text style={styles.valueCell}>{money(vatAmount)}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.labelCell}>Net Amount Paid to Brand</Text>
            <Text style={styles.valueCell}>{money(netAmountPaid)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This statement was automatically generated when the settlement was completed.
        </Text>
      </Page>
    </Document>
  );
}

export default SettlementStatementPDF;
