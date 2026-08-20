const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSettings).put(updateSettings);

module.exports = router;
