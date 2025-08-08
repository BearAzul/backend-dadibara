// controllers/galleryController.js
import Gallery from "../models/GalleryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await Gallery.find({});
  res.status(200).json(images);
});

export const createGalleryImage = asyncHandler(async (req, res) => {
  let { title, description } = req.body;

  // URL lengkap dari Cloudinary ada di req.file.path
  if (!req.file) {
    res.status(400);
    throw new Error("Harap unggah file gambar.");
  }
  const src = req.file.path;

  const newImage = await Gallery.create({ src, title, description });
  res.status(201).json(newImage);
});

export const updateGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  // Jika ada file baru diunggah, gunakan URL baru. Jika tidak, gunakan src yang lama.
  let src = req.file ? req.file.path : req.body.src;

  const updatedImage = await Gallery.findByIdAndUpdate(
    id,
    { src, title, description },
    { new: true, runValidators: true }
  );

  if (!updatedImage) {
    res.status(404);
    throw new Error("Gambar tidak ditemukan");
  }

  res.status(200).json(updatedImage);
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedImage = await Gallery.findByIdAndDelete(id);

  if (!deletedImage) {
    res.status(404);
    throw new Error("Gambar tidak ditemukan");
  }

  res.status(200).json({ message: "Gambar berhasil dihapus" });
});
