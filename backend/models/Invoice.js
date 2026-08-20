const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String },
  job: { type: mongoose.Schema.ObjectId, ref: 'Job' },
  customer: { type: mongoose.Schema.ObjectId, ref: 'Customer' },
  client: {
    name: { type: String, default: 'General Client' },
    phone: { type: String },
    address: { type: String },
    email: { type: String }
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number }
  }],
  labourCost: { type: Number, default: 0 },
  materialCost: { type: Number, default: 0 },
  transportCharge: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  otherCharge: { type: Number, default: 0 },
  otherChargeLabel: { type: String, default: 'Other' },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  transactionId: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  paymentMethod: {
    type: String,
    default: 'Cash'
  },
  dueDate: { type: Date },
  notes: { type: String },
  termsAndConditions: { type: String },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-4);
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}-${timestamp}`;
  }

  // Calculate item totals
  let itemsTotal = 0;
  if (this.items && this.items.length > 0) {
    this.items = this.items.map(item => {
      const lineTotal = Number(((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2));
      itemsTotal += lineTotal;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: lineTotal
      };
    });
  }

  const baseAmount = itemsTotal + (this.labourCost || 0) + (this.materialCost || 0) + (this.transportCharge || 0) + (this.serviceCharge || 0) + (this.otherCharge || 0);

  let discountAmount = 0;
  if (this.discount > 0) {
    discountAmount = this.discountType === 'percentage'
      ? baseAmount * (this.discount / 100)
      : this.discount;
  }

  this.subtotal = Math.max(0, baseAmount - discountAmount);
  this.tax = Number((this.subtotal * ((this.taxRate || 0) / 100)).toFixed(2));
  this.totalAmount = Number((this.subtotal + this.tax).toFixed(2));
  this.balanceDue = Math.max(0, Number((this.totalAmount - (this.amountPaid || 0)).toFixed(2)));

  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
