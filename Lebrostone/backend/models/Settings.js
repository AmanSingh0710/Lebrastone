const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'banner_settings' },
  currentBannerUrl: { type: String, default: '/banar/banner1.jpg' }
});

module.exports = mongoose.model('Settings', SettingsSchema);