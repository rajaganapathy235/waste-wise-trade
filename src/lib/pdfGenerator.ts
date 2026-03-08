import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LedgerEntry } from "./ledgerData";

/** Company info – centralised so it's easy to change later */
const COMPANY = {
  name: "HYTEX COTTON MILLS",
  address: "SFNO. 71/1, ST-2, PARAPPU THOTTAM, Munivandi Vilas Hotel, UTHUKULI TOWN PANCHAYAT, UTHUKULI",
  city: "Tiruppur",
  state: "Tamil Nadu",
  email: "hytexcottonmills@gmail.com",
  gstin: "33ASWPV8266F1ZW",
  contact: "8870796169",
};

interface PartyInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  contact?: string;
}

/** Draw the common company + party header block and return the Y position after it */
function drawHeader(doc: jsPDF, title: string, party: PartyInfo): number {
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const boxX = marginX;
  const boxW = pageW - marginX * 2;

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageW / 2, 18, { align: "center" });

  // Outer box top
  let y = 24;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);

  // Company block
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, pageW / 2, y + 6, { align: "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const lines = [
    COMPANY.address,
    COMPANY.city,
    COMPANY.state,
    COMPANY.email,
    COMPANY.gstin,
    `Contact : ${COMPANY.contact}`,
  ];
  let lineY = y + 12;
  lines.forEach((line) => {
    doc.text(line, pageW / 2, lineY, { align: "center" });
    lineY += 4;
  });

  // Separator line
  lineY += 1;
  doc.line(boxX + 4, lineY, boxX + boxW - 4, lineY);
  lineY += 5;

  // Party block
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(party.name, pageW / 2, lineY, { align: "center" });
  lineY += 5;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const partyLines = [
    party.address || "",
    party.city || "",
    party.state || "",
    `Contact : ${party.contact || ""}`,
  ].filter(Boolean);
  partyLines.forEach((line) => {
    doc.text(line, pageW / 2, lineY, { align: "center" });
    lineY += 4;
  });

  // Draw the surrounding rectangle
  const boxH = lineY - y + 4;
  doc.rect(boxX, y, boxW, boxH);

  return lineY + 6;
}

// ─── LEDGER PDF ──────────────────────────────────────────────

export function generateLedgerPDF(
  entries: LedgerEntry[],
  party: PartyInfo,
  periodLabel?: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let startY = drawHeader(doc, "Ledger", party);

  // "All Records" label
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("All Records", doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });
  startY += 5;

  // Build running balance rows
  let runningBalance = 0;
  const bodyRows: (string | number)[][] = [];

  // Opening balance row
  bodyRows.push(["", "", "Opening Balance", "", "", "", "0.00"]);

  entries.forEach((e, i) => {
    runningBalance += e.debit - e.credit;
    const balStr = `${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? "DR" : "CR"}`;
    bodyRows.push([
      String(i + 1),
      e.date,
      e.type.charAt(0).toUpperCase() + e.type.slice(1).toLowerCase(),
      String(e.invoiceNo),
      e.credit.toFixed(2),
      e.debit.toFixed(2),
      balStr,
    ]);
  });

  // Closing balance row
  const closingStr = `${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? "DR" : "CR"}`;
  bodyRows.push(["", "", "Closing Balance", "", "", "", closingStr]);

  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalBalStr = `${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? "DR" : "CR"}`;

  autoTable(doc, {
    startY,
    head: [["Sr\nNo", "Date", "Account", "Inv. No.", "Credit", "Debit", "Balance"]],
    body: bodyRows,
    foot: [["", "", "", "Total", totalCredit.toFixed(2), totalDebit.toFixed(2), totalBalStr]],
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8, lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fontStyle: "bold", fontSize: 8, halign: "left", fillColor: false, textColor: [0, 0, 0] },
    footStyles: { fontStyle: "bold", fontSize: 8, fillColor: false, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 24 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
      6: { cellWidth: 32, halign: "right" },
    },
    didParseCell: (data) => {
      // Style Opening/Closing Balance rows
      if (data.section === "body") {
        const rowData = data.row.raw as string[];
        if (rowData && (rowData[2] === "Opening Balance" || rowData[2] === "Closing Balance")) {
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  return doc;
}

// ─── STATEMENT PDF ───────────────────────────────────────────

export function generateStatementPDF(
  entries: LedgerEntry[],
  party: PartyInfo,
  periodLabel?: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let startY = drawHeader(doc, "Statement", party);

  // Table: Sr., Date, Type, Number, Sales (amount)
  const bodyRows = entries.map((e, i) => [
    String(i + 1),
    e.date,
    e.type.charAt(0).toUpperCase() + e.type.slice(1).toLowerCase(),
    String(e.invoiceNo),
    (e.debit || e.credit).toFixed(2),
  ]);

  const total = entries.reduce((s, e) => s + (e.debit || e.credit), 0);

  autoTable(doc, {
    startY,
    head: [["Sr.", "Date", "Type", "Number", "Sales"]],
    body: bodyRows,
    foot: [["", "", "", "Total", total.toFixed(2)]],
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8, lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fontStyle: "bold", fontSize: 8, halign: "left", fillColor: false, textColor: [0, 0, 0] },
    footStyles: { fontStyle: "bold", fontSize: 8, fillColor: false, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 40, halign: "center" },
      4: { cellWidth: 36, halign: "right" },
    },
  });

  return doc;
}
