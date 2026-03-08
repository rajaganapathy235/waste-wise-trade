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

export interface PartyInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  stateCode?: string;
  contact?: string;
  email?: string;
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

// ─── INVOICE PDF ─────────────────────────────────────────────

export interface InvoiceItem {
  name: string;
  hsn?: string;
  qty: number;
  rate: number;
  per?: string;
  discount: number;
}

export interface InvoiceData {
  billTitle: string; // "Tax Invoice" | "Bill Of Supply"
  invoiceNo: string; // e.g. "Invoice63" or "Purchase10"
  date: string;
  billType: string; // Sales | Purchase | Quotation
  party: PartyInfo;
  items: InvoiceItem[];
  gstType: "CGST/SGST" | "IGST";
  gstRate: number; // e.g. 0.05 for 5%
  vehicleNo?: string;
  freightCharge?: number;
  packagingCharge?: number;
  tcsAmount?: number;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
}

/** Convert number to Indian Rupee words */
function amountInWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";
  const intPart = Math.floor(Math.abs(num));
  const paisePart = Math.round((Math.abs(num) - intPart) * 100);

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  let result = "Indian Rupees " + convert(intPart);
  if (paisePart > 0) result += " and " + convert(paisePart) + " Paise";
  result += " Only";
  return result;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const mx = 10; // margin x
  const contentW = pageW - mx * 2;
  const midX = mx + contentW / 2;

  let y = 12;

  // ── Title ──
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.billTitle, pageW / 2, y, { align: "center" });
  y += 6;

  // ── Top section: Company (left) + Invoice grid (right) ──
  const topY = y;
  const leftW = contentW * 0.48;
  const rightW = contentW * 0.52;
  const rightX = mx + leftW;

  // Company info (left)
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(mx, topY, leftW, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, mx + 2, topY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const companyLines = [
    COMPANY.address,
    `City : ${COMPANY.city}, ${COMPANY.state} - 638752`,
    `GSTIN/UIN : ${COMPANY.gstin}`,
    `State Name : ${COMPANY.state}  Code :33`,
    `Email : ${COMPANY.email}`,
    `Mobile : ${COMPANY.contact}`,
  ];
  let cY = topY + 9;
  companyLines.forEach((line) => {
    const split = doc.splitTextToSize(line, leftW - 4);
    doc.text(split, mx + 2, cY);
    cY += split.length * 3.2;
  });

  // Invoice detail grid (right)
  const gridRows = [
    ["Invoice No:", data.invoiceNo, "Dated", data.date],
    ["Delivery Note", "", "Mode/Terms of Payment", ""],
    ["Eway Bill Number", "", "Vehicle Number", data.vehicleNo || ""],
    ["Buyer's Order No.", "", "Date", ""],
    ["Dispatched Doc No.", "", "Delivery Note Date", ""],
    ["Dispatched through", "", "Destination", ""],
    ["Terms of Delivery", "", "", ""],
  ];

  const cellH = 48 / gridRows.length;
  const colW = rightW / 2;
  gridRows.forEach((row, i) => {
    const rY = topY + i * cellH;
    doc.rect(rightX, rY, colW, cellH);
    doc.rect(rightX + colW, rY, colW, cellH);

    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], rightX + 1.5, rY + 3.5);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], rightX + 1.5, rY + cellH - 1);

    doc.setFont("helvetica", "normal");
    doc.text(row[2], rightX + colW + 1.5, rY + 3.5);
    doc.setFont("helvetica", "bold");
    doc.text(row[3], rightX + colW + 1.5, rY + cellH - 1);
  });

  y = topY + 48;

  // ── Buyer (Bill To) ──
  const buyerH = 28;
  doc.rect(mx, y, contentW, buyerH);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Buyer (Bill To)", mx + 2, y + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(data.party.name, mx + 2, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const buyerLines = [
    data.party.address || "",
    `City : ${data.party.city || "TIRUPPUR"}, ${data.party.state || "TAMILNADU"}`,
    data.party.gstin ? `GSTIN/UIN : ${data.party.gstin}` : "",
    `State Name : ${data.party.state || "TAMILNADU"}  Code :33`,
    data.party.contact ? `Mobile : ${data.party.contact}` : "",
  ].filter(Boolean);
  let bY = y + 12;
  buyerLines.forEach((line) => {
    doc.text(line, mx + 2, bY);
    bY += 3.2;
  });

  y += buyerH;

  // ── Items Table ──
  const itemRows = data.items.map((item, i) => {
    const amount = item.qty * item.rate - item.discount;
    return [
      String(i + 1) + ".",
      item.name,
      item.hsn || "",
      item.qty.toFixed(2),
      item.rate.toFixed(2),
      item.per || "KGS",
      amount.toFixed(2),
    ];
  });

  // Calculate taxes
  const subTotal = data.items.reduce((s, i) => s + (i.qty * i.rate - i.discount), 0);
  const halfRate = (data.gstRate * 100 / 2).toFixed(1);
  const taxPerSide = subTotal * data.gstRate / 2;
  const totalTax = subTotal * data.gstRate;
  const extras = (data.freightCharge || 0) + (data.packagingCharge || 0) + (data.tcsAmount || 0);
  const grandTotal = subTotal + totalTax + extras;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  // Add tax rows to items
  const blankRow = (label: string, amount: string) => ["", label, "", "", "", "", amount];

  itemRows.push(blankRow("", subTotal.toFixed(2)));

  if (data.gstType === "CGST/SGST") {
    itemRows.push(blankRow("CGST", taxPerSide.toFixed(2)));
    itemRows.push(blankRow("SGST", taxPerSide.toFixed(2)));
  } else {
    itemRows.push(blankRow("IGST", totalTax.toFixed(2)));
  }

  if (data.freightCharge) itemRows.push(blankRow("Freight Charge", data.freightCharge.toFixed(2)));
  if (data.packagingCharge) itemRows.push(blankRow("Packaging Charge", data.packagingCharge.toFixed(2)));
  if (data.tcsAmount) itemRows.push(blankRow("TCS Tax", data.tcsAmount.toFixed(2)));

  if (Math.abs(roundOff) > 0.001) {
    itemRows.push(blankRow("Round Off", roundOff.toFixed(2)));
  }

  autoTable(doc, {
    startY: y,
    head: [["Sr.", "Description of Goods", "HSN/SAC", "Qty", "Rate", "per", "Amount"]],
    body: itemRows,
    foot: [["", "", "", "Total", "", "", finalTotal.toFixed(2)]],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: false, textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
    footStyles: { fillColor: false, textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 52 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 28, halign: "right" },
    },
    margin: { left: mx, right: mx },
  });

  y = (doc as any).lastAutoTable?.finalY || y + 60;

  // ── Amount in words ──
  doc.rect(mx, y, contentW, 8);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Chargeable (in words)", mx + 2, y + 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(amountInWords(finalTotal), mx + 2, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("E & OE", mx + contentW - 12, y + 3);
  y += 8;

  // ── Tax Breakdown Table ──
  const taxableVal = subTotal.toFixed(2);
  const hsnCode = data.items[0]?.hsn || "";

  if (data.gstType === "CGST/SGST") {
    autoTable(doc, {
      startY: y,
      head: [["HSN/SAC", "Taxable Value", { content: "State Tax", colSpan: 2 }, { content: "Central Tax", colSpan: 2 }, "Total Tax"]],
      body: [
        ["", "", "Rate", "Amount", "Rate", "Amount", ""],
        [hsnCode, taxableVal, `${halfRate}%`, taxPerSide.toFixed(2), `${halfRate}%`, taxPerSide.toFixed(2), totalTax.toFixed(2)],
        ["Total", taxableVal, "", taxPerSide.toFixed(2), "", taxPerSide.toFixed(2), totalTax.toFixed(2)],
      ],
      theme: "grid",
      styles: { fontSize: 6.5, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
      headStyles: { fillColor: false, textColor: [0, 0, 0], fontStyle: "bold", fontSize: 6.5 },
      margin: { left: mx, right: mx },
    });
  } else {
    autoTable(doc, {
      startY: y,
      head: [["HSN/SAC", "Taxable Value", "IGST Rate", "IGST Amount", "Total Tax"]],
      body: [
        [hsnCode, taxableVal, `${(data.gstRate * 100).toFixed(1)}%`, totalTax.toFixed(2), totalTax.toFixed(2)],
        ["Total", taxableVal, "", totalTax.toFixed(2), totalTax.toFixed(2)],
      ],
      theme: "grid",
      styles: { fontSize: 6.5, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
      headStyles: { fillColor: false, textColor: [0, 0, 0], fontStyle: "bold", fontSize: 6.5 },
      margin: { left: mx, right: mx },
    });
  }

  y = (doc as any).lastAutoTable?.finalY || y + 20;

  // ── Bank Details ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Our Bank   : ${COMPANY.name}`, mx + 2, y + 5);
  doc.text(`Account Number : 0550020000765`, mx + 2, y + 9);
  doc.text(`IFSC Code    : BARB0UTTUKU`, mx + 2, y + 13);

  // ── Signature block ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`For ${COMPANY.name}`, mx + contentW - 45, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Authorised Signatory", mx + contentW - 40, y + 22);

  // ── Declaration ──
  y += 16;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Description", mx + 2, y);
  const decl = doc.splitTextToSize(
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    contentW * 0.45
  );
  doc.text(decl, mx + 2, y + 3.5);

  y += 14;
  doc.setFontSize(7);
  doc.text("This is computer generated Invoice", pageW / 2, y, { align: "center" });

  return doc;
}
