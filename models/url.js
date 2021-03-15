const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema ({
  urlname : String,
  urltitle : String,
  like : {
    type : Number,
    default : 0
  }
})

module.exports = mongoose.model('url', urlSchema);


