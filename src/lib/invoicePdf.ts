import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { GSTInvoice } from "@/pages/Billing";

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function generateInvoicePdf(inv: GSTInvoice, logoDataUrl?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 10; // margin
  const cW = W - 2 * M; // content width
  let y = M;

  const line = (y1: number) => { doc.setDrawColor(40); doc.setLineWidth(0.3); doc.line(M, y1, W - M, y1); };
  const vline = (x: number, y1: number, y2: number) => { doc.setDrawColor(40); doc.setLineWidth(0.3); doc.line(x, y1, x, y2); };
  const rect = (x: number, y1: number, w: number, h: number) => { doc.setDrawColor(40); doc.setLineWidth(0.4); doc.rect(x, y1, w, h); };

  // Outer border
  rect(M, M, cW, 0); // will be closed at end

  // ─── Title ───
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const typeLabel: Record<string, string> = {
    "sale-invoice": "TAX INVOICE", "purchase-invoice": "PURCHASE INVOICE", "quotation": "QUOTATION",
    "delivery-challan": "DELIVERY CHALLAN", "proforma": "PROFORMA INVOICE", "purchase-order": "PURCHASE ORDER",
    "sale-order": "SALE ORDER", "job-work": "JOB WORK INVOICE", "credit-note": "CREDIT NOTE", "debit-note": "DEBIT NOTE",
  };
  doc.text(typeLabel[inv.type] || "INVOICE", W / 2, y + 6, { align: "center" });
  y += 10;
  line(y);

  // ─── IRN ───
  if (inv.irn) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`IRN : ${inv.irn}`, M + 2, y + 3.5);
    if (inv.ackNo) doc.text(`Ack No. : ${inv.ackNo}    Ack Date : ${inv.ackDate || ""}`, M + 2, y + 7);
    y += inv.ackNo ? 9 : 5;
    line(y);
  }

  // ─── Seller + Invoice Meta ───
  const sellerY = y;
  const midX = M + cW * 0.58;

  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", M + 2, y + 1, 14, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(inv.sellerName, M + 18, y + 5.5);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(inv.sellerAddress, M + 18, y + 9);
      doc.text(`GSTIN/UIN: ${inv.sellerGstin}`, M + 18, y + 12.5);
      doc.text(`State Name : ${inv.sellerState}, Code : ${inv.sellerStateCode}`, M + 2, y + 17);
    } catch {
      // Fallback without logo
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(inv.sellerName, M + 2, y + 4.5);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(inv.sellerAddress, M + 2, y + 8);
      doc.text(`GSTIN/UIN: ${inv.sellerGstin}`, M + 2, y + 11.5);
      doc.text(`State Name : ${inv.sellerState}, Code : ${inv.sellerStateCode}`, M + 2, y + 15);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(inv.sellerName, M + 2, y + 4.5);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(inv.sellerAddress, M + 2, y + 8);
    doc.text(`GSTIN/UIN: ${inv.sellerGstin}`, M + 2, y + 11.5);
    doc.text(`State Name : ${inv.sellerState}, Code : ${inv.sellerStateCode}`, M + 2, y + 15);
  }

  // Right side — invoice meta
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No.", midX + 2, y + 4);
  doc.text(inv.invoiceNo, midX + 2, y + 7.5);
  doc.text("Dated", midX + cW * 0.22, y + 4);
  doc.text(inv.date, midX + cW * 0.22, y + 7.5);
  doc.setFont("helvetica", "normal");
  doc.text(inv.deliveryNote || "Delivery Note", midX + 2, y + 11);
  doc.text(inv.modeOfPayment || "Mode/Terms of Payment", midX + cW * 0.22, y + 11);

  y += 18;
  line(y);
  vline(midX, sellerY, y);

  // ─── Consignee (Ship to) ───
  const consY = y;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Consignee (Ship to)", M + 2, y + 3);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(inv.consigneeName, M + 2, y + 7);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(inv.consigneeAddress, M + 2, y + 10.5);
  doc.text(`GSTIN/UIN : ${inv.consigneeGstin}`, M + 2, y + 14);
  doc.text(`State Name : ${inv.consigneeState}, Code : ${inv.consigneeStateCode}`, M + 2, y + 17.5);

  // Right — buyer order etc
  doc.setFontSize(7);
  doc.text("Buyer's Order No.", midX + 2, y + 4);
  doc.text(inv.buyerOrderNo || "", midX + 2, y + 7.5);
  doc.text("Dispatch Doc No.", midX + 2, y + 11);
  doc.text(inv.dispatchDocNo || "", midX + 2, y + 14.5);

  y += 20;
  line(y);
  vline(midX, consY, y);

  // ─── Buyer (Bill to) ───
  const buyY = y;
  doc.setFontSize(6);
  doc.text("Buyer (Bill to)", M + 2, y + 3);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(inv.buyerName, M + 2, y + 7);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(inv.buyerAddress, M + 2, y + 10.5);
  doc.text(`GSTIN/UIN : ${inv.buyerGstin}`, M + 2, y + 14);
  doc.text(`State Name : ${inv.buyerState}, Code : ${inv.buyerStateCode}`, M + 2, y + 17.5);

  // Right
  doc.text("Dispatched through", midX + 2, y + 4);
  doc.text(inv.dispatchedThrough || "", midX + 2, y + 7.5);
  doc.text("Destination", midX + 2, y + 11);
  doc.text(inv.destination || "", midX + 2, y + 14.5);

  y += 20;
  line(y);
  vline(midX, buyY, y);

  // ─── Items Table ───
  const itemRows = inv.items.map((item) => [
    String(item.slNo),
    item.description,
    item.hsnSac,
    `${item.qty} ${item.unit}`,
    fmt(item.rate),
    item.per,
    item.discount ? `${item.discount}%` : "",
    fmt(item.amount),
  ]);

  // Tax rows
  if (inv.type !== "delivery-challan") {
    if (inv.isIgst) {
      itemRows.push(["", "", "", "", "IGST", "", `${inv.igstRate}%`, fmt(inv.igstAmount)]);
    } else {
      itemRows.push(["", "", "", "", "CGST", "", `${inv.cgstRate}%`, fmt(inv.cgstAmount)]);
      itemRows.push(["", "", "", "", "SGST", "", `${inv.sgstRate}%`, fmt(inv.sgstAmount)]);
    }
  }

  // Total row
  const totalQty = inv.items.reduce((s, i) => s + i.qty, 0);
  itemRows.push(["", "Total", "", `${totalQty} ${inv.items[0]?.unit || ""}`, "", "", "", fmt(inv.totalAmount)]);

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Sl", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Disc.", "Amount"]],
    body: itemRows,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: [40, 40, 40], lineWidth: 0.2 },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], fontStyle: "bold", fontSize: 6.5 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 45 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 14, halign: "center" },
      7: { cellWidth: 28, halign: "right" },
    },
    didParseCell: (data) => {
      // Bold the total row
      if (data.row.index === itemRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 8;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY;

  // ─── Amount in Words ───
  line(y);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Chargeable (in words)", M + 2, y + 3.5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(inv.amountInWords, M + 2, y + 7.5);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("E. & O.E", W - M - 2, y + 3.5, { align: "right" });
  y += 10;
  line(y);

  // ─── HSN/SAC Summary ───
  if (inv.type !== "delivery-challan") {
    const hsnCodes = Array.from(new Set(inv.items.map((i) => i.hsnSac)));
    const hsnRows = hsnCodes.map((hsn) => {
      const hsnItems = inv.items.filter((i) => i.hsnSac === hsn);
      const taxable = hsnItems.reduce((s, i) => s + i.amount, 0);
      const cgst = inv.isIgst ? 0 : Math.round(taxable * inv.cgstRate / 100);
      const sgst = inv.isIgst ? 0 : Math.round(taxable * inv.sgstRate / 100);
      const igst = inv.isIgst ? Math.round(taxable * inv.igstRate / 100) : 0;
      const totalTax = cgst + sgst + igst;
      return [hsn, fmt(taxable), inv.isIgst ? "-" : `${inv.cgstRate}%`, inv.isIgst ? "-" : fmt(cgst), inv.isIgst ? "-" : `${inv.sgstRate}%`, inv.isIgst ? "-" : fmt(sgst), fmt(totalTax)];
    });
    // Total row
    const totalTax = inv.cgstAmount + inv.sgstAmount + inv.igstAmount;
    hsnRows.push(["Total", fmt(inv.taxableAmount), "", fmt(inv.cgstAmount), "", fmt(inv.sgstAmount), fmt(totalTax)]);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["HSN/SAC", "Taxable Value", "CGST Rate", "CGST Amt", "SGST Rate", "SGST Amt", "Total Tax"]],
      body: hsnRows,
      theme: "grid",
      styles: { fontSize: 6, cellPadding: 1.2, lineColor: [40, 40, 40], lineWidth: 0.2 },
      headStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], fontStyle: "bold", fontSize: 5.5 },
      columnStyles: {
        0: { cellWidth: 22 }, 1: { halign: "right" }, 2: { halign: "center" },
        3: { halign: "right" }, 4: { halign: "center" }, 5: { halign: "right" }, 6: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.row.index === hsnRows.length - 1) data.cell.styles.fontStyle = "bold";
      },
    });
    y = (doc as any).lastAutoTable.finalY;

    // Tax in words
    if (inv.taxAmountInWords) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text(`Tax Amount (in words) : `, M + 2, y + 3.5);
      doc.setFont("helvetica", "bold");
      doc.text(inv.taxAmountInWords, M + 30, y + 3.5);
      y += 5;
      line(y);
    }
  }

  // ─── Declaration + Signatory ───
  const declY = y;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Declaration", M + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const declText = inv.declaration || "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
  const declLines = doc.splitTextToSize(declText, cW * 0.5 - 4);
  doc.text(declLines, M + 2, y + 7.5);

  if (inv.paymentTerms) {
    doc.setFont("helvetica", "bold");
    doc.text("Payment Terms: ", M + 2, y + 7.5 + declLines.length * 3);
    doc.setFont("helvetica", "normal");
    doc.text(inv.paymentTerms, M + 22, y + 7.5 + declLines.length * 3);
  }

  // Signatory (right side)
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`for ${inv.sellerName}`, W - M - 2, y + 4, { align: "right" });
  doc.text("Authorised Signatory", W - M - 2, y + 20, { align: "right" });

  y += 24;
  vline(M + cW * 0.5, declY, y);
  line(y);

  // Footer
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("This is a Computer Generated Invoice", W / 2, y + 3.5, { align: "center" });
  y += 5;

  // Outer border
  rect(M, M, cW, y - M);

  // Save
  doc.save(`${inv.invoiceNo.replace(/\//g, "-")}.pdf`);
}
