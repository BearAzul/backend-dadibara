// controllers/pendaftaranController.js
import Pendaftar from "../models/pendaftarModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Ambil semua pendaftar
// @route   GET /api/pendaftaran
// @access  Admin
export const getPendaftar = asyncHandler(async (req, res) => {
  const pendaftar = await Pendaftar.find({});
  res.status(200).json(pendaftar);
});

// @desc    Tambahkan pendaftar baru
// @route   POST /api/pendaftaran
// @access  Public
// pendaftaranController.js
export const addPendaftar = asyncHandler(async (req, res) => {
  // ▼▼▼ TAMBAHKAN INI ▼▼▼
  console.log("Data Gender yang diterima backend:", req.body.gender);
  console.log("Data mentah yang diterima backend:");
  console.log(req.body);
  // ▲▲▲ ----------------- ▲▲▲
  const {
    name,
    email,
    gender,
    phone,
    address,
    position,
    birthDate,
    education,
    interests,
  } = req.body;

  const newPendaftar = await Pendaftar.create({
    name,
    email,
    gender,
    phone,
    address,
    position,
    birthDate,
    education,
    interests,
  });

  res.status(201).json(newPendaftar);
});

export const deletePendaftar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedPendaftar = await Pendaftar.findByIdAndDelete(id);

  if (!deletedPendaftar) {
    res.status(404);
    throw new Error("Pendaftar tidak ditemukan.");
  }

  res.status(200).json({ message: "Pendaftar berhasil dihapus." });
});
