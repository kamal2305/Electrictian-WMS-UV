const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const PDFDocument = require('pdfkit');

exports.getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
    const invoices = await Invoice.find(query)
      .populate('job', 'title')
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('job')
      .populate('customer')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createInvoice = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateInvoice = async (req, res) => {
  try {
    // Use findById + save to trigger pre-save hook for recalculations
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    Object.assign(invoice, req.body);
    await invoice.save();
    res.status(200).json({ success: true, data: invoice });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    await invoice.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('job', 'title')
      .populate('customer', 'name phone address')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const settings = await Settings.findOne({ user: req.user.id });
    const companyName = settings?.companyName || 'ElectroTrack WMS';
    const currency = settings?.currencySymbol || '₹';
    const companyAddress = settings?.companyAddress || '';
    const companyPhone = settings?.companyPhone || '';

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Header: Company Info
    doc.fontSize(22).font('Helvetica-Bold').text(companyName, 50, 50);
    if (companyAddress) doc.fontSize(10).font('Helvetica').text(companyAddress, 50, 78);
    if (companyPhone) doc.fontSize(10).text(`Ph: ${companyPhone}`, 50, 92);

    // Invoice title top-right
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#6366f1').text('INVOICE', 400, 50, { align: 'right', width: 145 });
    doc.fontSize(10).font('Helvetica').fillColor('#000000')
      .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 88, { align: 'right', width: 145 })
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 400, 102, { align: 'right', width: 145 });
    if (invoice.dueDate) {
      doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 400, 116, { align: 'right', width: 145 });
    }

    // Divider
    doc.moveTo(50, 135).lineTo(545, 135).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // Bill To
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6366f1').text('BILL TO', 50, 150);
    const clientName = invoice.customer?.name || invoice.client?.name || 'N/A';
    const clientPhone = invoice.customer?.phone || invoice.client?.phone || '';
    const clientAddress = invoice.customer?.address || invoice.client?.address || '';
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(clientName, 50, 165);
    if (clientPhone) doc.fontSize(10).font('Helvetica').fillColor('#374151').text(`Ph: ${clientPhone}`, 50, 181);
    if (clientAddress) doc.text(clientAddress, 50, 195);

    // Status badge area
    const statusColors = { Paid: '#10b981', 'Partially Paid': '#3b82f6', Draft: '#6b7280', Sent: '#f59e0b', Overdue: '#ef4444' };
    const statusColor = statusColors[invoice.status] || '#6b7280';
    doc.roundedRect(400, 150, 145, 28, 6).fill(statusColor);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff').text(invoice.status, 400, 158, { align: 'center', width: 145 });
    doc.fillColor('#000000');

    // Items Table
    const tableTop = 240;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, tableTop, 495, 22).fill('#6366f1');
    doc.text('Description', 58, tableTop + 6);
    doc.text('Qty', 320, tableTop + 6, { width: 50, align: 'right' });
    doc.text('Unit Price', 375, tableTop + 6, { width: 80, align: 'right' });
    doc.text('Total', 460, tableTop + 6, { width: 80, align: 'right' });

    let y = tableTop + 22;
    doc.font('Helvetica').fillColor('#111827').fontSize(10);
    (invoice.items || []).forEach((item, i) => {
      const bg = i % 2 === 0 ? '#f9fafb' : '#ffffff';
      doc.rect(50, y, 495, 22).fill(bg);
      doc.fillColor('#111827')
        .text(item.description, 58, y + 6, { width: 258 })
        .text(String(item.quantity), 320, y + 6, { width: 50, align: 'right' })
        .text(`${currency}${Number(item.unitPrice).toFixed(2)}`, 375, y + 6, { width: 80, align: 'right' })
        .text(`${currency}${Number(item.total || item.quantity * item.unitPrice).toFixed(2)}`, 460, y + 6, { width: 80, align: 'right' });
      y += 22;
    });

    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    y += 15;

    // Summary
    const summaryRows = [
      ['Labour Cost', invoice.labourCost],
      ['Material Cost', invoice.materialCost],
    ];
    if (invoice.transportCharge > 0) summaryRows.push(['Transport Charge', invoice.transportCharge]);
    if (invoice.serviceCharge > 0) summaryRows.push(['Service Charge', invoice.serviceCharge]);
    if (invoice.otherCharge > 0) summaryRows.push([invoice.otherChargeLabel || 'Other', invoice.otherCharge]);
    if (invoice.discount > 0) summaryRows.push([`Discount (${invoice.discountType === 'percentage' ? invoice.discount + '%' : 'Fixed'})`, -invoice.discount]);
    if (invoice.tax > 0) summaryRows.push([`Tax (${invoice.taxRate}%)`, invoice.tax]);

    doc.font('Helvetica').fontSize(10).fillColor('#374151');
    summaryRows.forEach(([label, value]) => {
      doc.text(label, 350, y).text(`${currency}${Math.abs(Number(value)).toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      y += 18;
    });

    // Total
    doc.rect(350, y + 2, 195, 26).fill('#6366f1');
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
      .text('TOTAL', 358, y + 8)
      .text(`${currency}${Number(invoice.totalAmount).toFixed(2)}`, 460, y + 8, { width: 80, align: 'right' });
    doc.fillColor('#000000');
    y += 45;

    // Payment info
    if (invoice.paymentMethod) {
      doc.font('Helvetica').fontSize(10).fillColor('#374151')
        .text(`Payment Method: ${invoice.paymentMethod}`, 50, y);
      y += 16;
    }

    // Notes
    if (invoice.notes) {
      y += 10;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Notes:', 50, y);
      doc.font('Helvetica').fillColor('#374151').text(invoice.notes, 50, y + 14, { width: 495 });
      y += 30 + (Math.ceil(invoice.notes.length / 80) * 14);
    }

    // Terms
    if (invoice.termsAndConditions) {
      y += 10;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Terms & Conditions:', 50, y);
      doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(invoice.termsAndConditions, 50, y + 14, { width: 495 });
    }

    // Footer
    doc.fontSize(9).fillColor('#9ca3af')
      .text('Generated by ElectroTrack WMS', 50, 780, { align: 'center', width: 495 });

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
