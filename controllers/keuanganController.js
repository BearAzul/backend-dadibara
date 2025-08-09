import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Transaction from "../models/transactionModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// --- Konfigurasi Cloudinary ---
// Diletakkan langsung di sini agar file ini mandiri.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Helper Functions ---

/**
 * Mengunggah file buffer ke Cloudinary menggunakan stream.
 * @param {Buffer} fileBuffer Buffer file dari req.file.buffer
 * @returns {Promise<object>} Promise yang akan resolve dengan hasil upload dari Cloudinary.
 */
const uploadFromBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "keuangan_bukti", // Anda bisa mengganti nama folder ini
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Menghapus file dari Cloudinary berdasarkan URL-nya.
 * @param {string} fileUrl URL lengkap file di Cloudinary.
 */
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  // Ekstrak public_id dari URL. Contoh: folder/namafile
  const publicIdMatch = fileUrl.match(/\/keuangan_bukti\/([^\.]+)/);
  if (!publicIdMatch || !publicIdMatch[1]) {
    console.error("Tidak dapat mengekstrak public_id dari URL:", fileUrl);
    return;
  }
  const publicId = `keuangan_bukti/${publicIdMatch[1]}`;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus file lama dari Cloudinary:", error);
  }
};

// --- Controller Functions ---

// @desc    Ambil semua transaksi
// @route   GET /api/keuangan
// @access  Admin
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).sort({ time: -1 });
  res.status(200).json(transactions);
});

// @desc    Buat transaksi baru
// @route   POST /api/keuangan
// @access  Admin
export const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description } = req.body;
  let documentUrl = null;

  // Jika ada file yang di-upload (tersimpan di memory buffer)
  if (req.file) {
    const result = await uploadFromBuffer(req.file.buffer);
    documentUrl = result.secure_url; // Dapatkan URL aman dari Cloudinary
  }

  const newTransaction = await Transaction.create({
    type,
    amount,
    description,
    document: documentUrl,
  });

  res.status(201).json(newTransaction);
});

// @desc    Perbarui transaksi
// @route   PUT /api/keuangan/:id
// @access  Admin
export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, amount, description } = req.body;

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  let documentUrl = transaction.document; // Default: gunakan URL lama

  // Jika ada file baru yang di-upload
  if (req.file) {
    // Hapus file lama dari Cloudinary jika ada
    if (transaction.document) {
      await deleteFromCloudinary(transaction.document);
    }
    // Upload file baru dan dapatkan URL-nya
    const result = await uploadFromBuffer(req.file.buffer);
    documentUrl = result.secure_url;
  }

  // Perbarui properti transaksi
  transaction.type = type;
  transaction.amount = amount;
  transaction.description = description;
  transaction.document = documentUrl; // Set URL dokumen baru atau lama

  const updatedTransaction = await transaction.save();
  res.status(200).json(updatedTransaction);
});

// @desc    Hapus transaksi
// @route   DELETE /api/keuangan/:id
// @access  Admin
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  // Hapus dokumen dari Cloudinary sebelum menghapus dari database
  if (transaction.document) {
    await deleteFromCloudinary(transaction.document);
  }

  await Transaction.findByIdAndDelete(id);

  res.status(200).json({ message: "Transaksi berhasil dihapus" });
});
