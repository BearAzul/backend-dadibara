// controllers/skController.js
import SkDocument from "../models/skModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import fs from "fs"; // Modul Node.js untuk operasi file

// @desc    Ambil dokumen SK saat ini
// @route   GET /api/sk
// @access  Public
export const getSkDocument = asyncHandler(async (req, res) => {
  const sk = await SkDocument.findOne();
  res.status(200).json(sk);
});

// @desc    Upload dokumen SK baru
// @route   POST /api/sk
// @access  Admin
export const uploadSk = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Tidak ada file yang diunggah.");
  }

  const newFilePath = req.file.path.replace(/\\/g, "/");

  // Hapus dokumen SK yang lama jika ada
  const oldSk = await SkDocument.findOne();
  if (oldSk) {
    // Hapus file fisik lama di server
    if (fs.existsSync(oldSk.filePath)) {
      fs.unlinkSync(oldSk.filePath);
    }
    // Hapus dokumen lama dari database
    await SkDocument.findByIdAndDelete(oldSk._id);
  }

  const newSk = await SkDocument.create({ filePath: newFilePath });
  res.status(201).json(newSk);
});
