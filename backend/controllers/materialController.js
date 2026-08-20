const Material = require('../models/Material');

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ isInventory: false }).populate('job', 'title').populate('addedBy', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('job', 'title').populate('addedBy', 'name');
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.status(200).json({ success: true, data: material });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMaterialsByJob = async (req, res) => {
  try {
    const materials = await Material.find({ job: req.params.jobId }).populate('addedBy', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createMaterial = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.createMaterialForJob = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;
    req.body.job = req.params.jobId;
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.status(200).json({ success: true, data: material });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    await material.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getInventory = async (req, res) => {
  try {
    const materials = await Material.find({ isInventory: true }).sort('name');
    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createInventoryItem = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;
    req.body.isInventory = true;
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.status(200).json({ success: true, data: material });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMaterialRequests = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

exports.createMaterialRequest = async (req, res) => {
  res.status(201).json({ success: true, data: req.body });
};

exports.getMaterialUsage = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

exports.createMaterialUsage = async (req, res) => {
  res.status(201).json({ success: true, data: req.body });
};
