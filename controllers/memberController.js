// backend_new/controllers/memberController.js
import Member from "../models/memberModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Mengambil semua anggota
export const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({});
  res.status(200).json(members);
});

// Menambah anggota baru
export const createMember = asyncHandler(async (req, res) => {
  const { nama, title, titleLabel, whatsapp, instagram } = req.body;
  if (!req.file) {
    res.status(400);
    throw new Error("Foto wajib diunggah.");
  }
  const foto = req.file.path.replace(/\\/g, "/");

  const member = await Member.create({
    nama,
    foto,
    title,
    titleLabel,
    whatsapp,
    instagram,
  });
  res.status(201).json(member);
});

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (member) {
    res.status(200).json(member);
  } else {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }
});

// Memperbarui data pengurus
export const updateMember = asyncHandler(async (req, res) => {
  const { nama, title, titleLabel, whatsapp, instagram } = req.body;
  const member = await Member.findById(req.params.id);

  if (member) {
    member.nama = nama || member.nama;
    member.title = title || member.title;
    member.titleLabel = titleLabel || member.titleLabel;
    member.whatsapp = whatsapp || member.whatsapp;
    member.instagram = instagram || member.instagram;

    if (req.file) {
      member.foto = req.file.path.replace(/\\/g, "/");
    }

    const updatedMember = await member.save();
    res.status(200).json(updatedMember);
  } else {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    await member.deleteOne();
    res.status(200).json({ message: "Data pengurus berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }
});
