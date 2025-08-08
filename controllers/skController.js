// controllers/skController.js
import SkDocument from "../models/skModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
// fs tidak diperlukan lagi

export const getSkDocument = asyncHandler(async (req, res) => {
  const sk = await SkDocument.findOne().sort({ uploadDate: -1 }); // Ambil yang terbaru
  res.status(200).json(sk);
});

export const uploadSk = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Tidak ada file yang diunggah.");
  }

  // Hapus SK lama jika ada
  await SkDocument.deleteMany({});

  // Buat entri baru dengan URL dari Cloudinary
  const newSk = await SkDocument.create({ filePath: req.file.path });
  res.status(201).json(newSk);
});
