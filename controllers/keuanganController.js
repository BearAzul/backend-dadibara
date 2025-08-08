// controllers/keuanganController.js
import Transaction from "../models/transactionModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({});
  res.status(200).json(transactions);
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description } = req.body;
  let documentPath = null;

  if (req.file) {
    documentPath = req.file.path;
  }

  const newTransaction = await Transaction.create({
    type,
    amount,
    description,
    document: documentPath,
  });

  res.status(201).json(newTransaction);
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, amount, description } = req.body;
  let documentPath = req.body.document;

  if (req.file) {
    documentPath = req.file.path;
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    id,
    { type, amount, description, document: documentPath },
    { new: true, runValidators: true }
  );

  if (!updatedTransaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  res.status(200).json(updatedTransaction);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedTransaction = await Transaction.findByIdAndDelete(id);

  if (!deletedTransaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  res.status(200).json({ message: "Transaksi berhasil dihapus" });
});
