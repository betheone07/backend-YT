const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema ({
  urlname : String
})

module.exports = mongoose.model('url', urlSchema);


