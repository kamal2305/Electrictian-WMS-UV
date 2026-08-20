const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] };
    }
    const customers = await Customer.find(query).sort('-createdAt');
    // Add bill count
    const customersWithCount = await Promise.all(customers.map(async (c) => {
      const billCount = await Invoice.countDocuments({ customer: c._id });
      return { ...c.toObject(), billCount };
    }));
    res.status(200).json({ success: true, count: customers.length, data: customersWithCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const bills = await Invoice.find({ customer: req.params.id }).populate('job', 'title').sort('-createdAt');
    res.status(200).json({ success: true, data: { ...customer.toObject(), bills } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createCustomer = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, data: customer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    await customer.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
