const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, default: "" },
    customerName: { type: String, default: "" },
    productNames: {type: [String],required: true,},
    totalquantity: { type: Number, default: 0 },
    totaltax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { _id: false}
);

const productSchema = new mongoose.Schema(
  {
    productname: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    priceWithTax: { type: Number, required: true },
    discount: { type: Number , default: 0},
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    totalAmount: { type: Number, required: true },
    email: { type: String },
    address: { type: String },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    invoices: [itemSchema],
    products: [productSchema],
    customers: [customerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
