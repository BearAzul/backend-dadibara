// controllers/jadwalKegiatanController.js
import JadwalKegiatan from "../models/jadwalKegiatanModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Ambil semua jadwal kegiatan
// @route   GET /api/jadwal-kegiatan
// @access  Public
export const getJadwalKegiatan = asyncHandler(async (req, res) => {
  const jadwal = await JadwalKegiatan.find({});
  res.status(200).json(jadwal);
});

// @desc    Buat jadwal kegiatan baru
// @route   POST /api/jadwal-kegiatan
// @access  Admin
export const createJadwalKegiatan = asyncHandler(async (req, res) => {
  console.log("Menerima permintaan POST untuk jadwal kegiatan.");
  console.log("Request Body:", req.body);
  const { nama, tempat, tanggal, waktu, keterangan } = req.body;
  const newJadwal = await JadwalKegiatan.create({
    nama,
    tempat,
    tanggal,
    waktu,
    keterangan,
  });
  console.log("Jadwal baru berhasil dibuat:", newJadwal);
  res.status(201).json(newJadwal);
});

// @desc    Perbarui jadwal kegiatan
// @route   PUT /api/jadwal-kegiatan/:id
// @access  Admin
export const updateJadwalKegiatan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama, tempat, tanggal, waktu, keterangan } = req.body;

  const updatedJadwal = await JadwalKegiatan.findByIdAndUpdate(
    id,
    { nama, tempat, tanggal, waktu, keterangan },
    { new: true, runValidators: true }
  );

  if (!updatedJadwal) {
    res.status(404);
    throw new Error("Jadwal tidak ditemukan");
  }

  res.status(200).json(updatedJadwal);
});

// @desc    Hapus jadwal kegiatan
// @route   DELETE /api/jadwal-kegiatan/:id
// @access  Admin
export const deleteJadwalKegiatan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedJadwal = await JadwalKegiatan.findByIdAndDelete(id);

  if (!deletedJadwal) {
    res.status(404);
    throw new Error("Jadwal tidak ditemukan");
  }

  res.status(200).json({ message: "Jadwal berhasil dihapus" });
});
