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
  grid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  card: {
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
  labelCell: {
    width: "68%",
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  valueCell: {
    width: "32%",
    padding: 8,
    textAlign: "right",
  },
  footer: {
    marginTop: 18,
    fontSize: 9,
    color: "#6b7280",
  },
});

function CommissionInvoicePDF({ invoice }) {
  const {
    invoiceNumber,
    invoiceDate,
    company,
    client,
    description,
    settlementPeriod,
    paymentReference,
    money,
    vatRateLabel,
    commissionAmount,
    vatAmount,
    totalInvoiceAmount,
  } = invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Commission Tax Invoice</Text>
          <Text style={styles.subtitle}>
            {company.legalName} trading as {company.tradingName}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.text}>Invoice Number: {invoiceNumber}</Text>
            <Text style={styles.text}>Invoice Date: {invoiceDate}</Text>
            <Text style={styles.text}>Settlement Period: {settlementPeriod}</Text>
            <Text style={styles.text}>
              Payment Reference: {paymentReference || "N/A"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={styles.text}>{client.name}</Text>
            {client.contactName ? (
              <Text style={styles.text}>Attention: {client.contactName}</Text>
            ) : null}
            {client.email ? <Text style={styles.text}>{client.email}</Text> : null}
            {client.website ? <Text style={styles.text}>{client.website}</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issuer</Text>
          <Text style={styles.text}>{company.legalName}</Text>
          <Text style={styles.text}>Trading as {company.tradingName}</Text>
          <Text style={styles.text}>{company.address}</Text>
          {company.email ? <Text style={styles.text}>{company.email}</Text> : null}
          {company.website ? <Text style={styles.text}>{company.website}</Text> : null}
        </View>

        <View style={{ height: 16 }} />

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.labelCell}>Description</Text>
            <Text style={styles.valueCell}>{description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelCell}>Commission Amount (ex VAT)</Text>
            <Text style={styles.valueCell}>{money(commissionAmount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelCell}>VAT ({vatRateLabel})</Text>
            <Text style={styles.valueCell}>{money(vatAmount)}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.labelCell}>Total Invoice Amount</Text>
            <Text style={styles.valueCell}>{money(totalInvoiceAmount)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This invoice was automatically generated when the settlement was marked as paid.
        </Text>
      </Page>
    </Document>
  );
}

export default CommissionInvoicePDF;
