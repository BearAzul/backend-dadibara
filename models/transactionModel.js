// models/TransactionModel.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Pemasukkan", "Pengeluaran"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  document: {
    type: String,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
