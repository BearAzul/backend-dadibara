
import Member from "../models/memberModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const streamUploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return;
  const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus foto lama dari Cloudinary:", error);
  }
};

// Mengambil semua anggota
export const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({}).sort({ createdAt: -1 });
  res.status(200).json(members);
});

// Menambah anggota baru
export const createMember = asyncHandler(async (req, res) => {
  const { nama, title, titleLabel, whatsapp, instagram } = req.body;
  if (!req.file) {
    res.status(400);
    throw new Error("Foto wajib diunggah.");
  }

  const result = await streamUploadFromBuffer(req.file.buffer, "member_photos");

  const member = await Member.create({
    nama,
    foto: result.secure_url,
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


export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }

  member.nama = req.body.nama || member.nama;
  member.title = req.body.title || member.title;
  member.titleLabel = req.body.titleLabel || member.titleLabel;
  member.whatsapp = req.body.whatsapp || member.whatsapp;
  member.instagram = req.body.instagram || member.instagram;

  if (req.file) {

    await deleteFromCloudinary(member.foto);
 
    const result = await streamUploadFromBuffer(
      req.file.buffer,
      "member_photos"
    );
    member.foto = result.secure_url;
  }

  const updatedMember = await member.save();
  res.status(200).json(updatedMember);
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
