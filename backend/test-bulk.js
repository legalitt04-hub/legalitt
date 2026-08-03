require('dotenv').config();
const mongoose = require('mongoose');
const adminController = require('./src/controllers/adminController');

const mockReq = {
  file: {
    originalname: 'advocates_sample.csv',
    path: '../advocates_sample.csv'
  }
};
const mockRes = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { console.log('Response:', this.statusCode, j); }
};

async function run() {
  await mongoose.connect('mongodb+srv://legalitt:Legalitt123@cluster0.zoxxx.mongodb.net/?retryWrites=true&w=majority', { dbName: 'legalitt' }); // I will just try to run it without DB connection actually, wait, it uses User and Advocate models
  // Actually, I can mock User and Advocate
}
run();
