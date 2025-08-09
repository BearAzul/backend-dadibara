
import Gallery from "../models/galleryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const folderName = "gallery";

    let stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return;

  const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus gambar lama dari Cloudinary:", error);
  }
};

export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await Gallery.find({}).sort({ createdAt: -1 });
  res.status(200).json(images);
});

export const createGalleryImage = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("File gambar wajib diunggah.");
  }

  const result = await streamUpload(req);

  const newImage = await Gallery.create({
    src: result.secure_url,
    title,
    description,
  });

  res.status(201).json(newImage);
});

export const updateGalleryImage = asyncHandler(async (req, res) => {
   const { id } = req.params;
   const { title, description } = req.body;
   let newImageUrl;

   const imageToUpdate = await Gallery.findById(id);
   if (!imageToUpdate) {
     res.status(404);
     throw new Error("Gambar tidak ditemukan");
   }

   if (req.file) {
     await deleteFromCloudinary(imageToUpdate.src);

     const result = await streamUpload(req);
     newImageUrl = result.secure_url;
   }

   imageToUpdate.title = title || imageToUpdate.title;
   imageToUpdate.description = description || imageToUpdate.description;
   if (newImageUrl) {
     imageToUpdate.src = newImageUrl;
   }

   const updatedImage = await imageToUpdate.save();
   res.status(200).json(updatedImage);
});

// @desc    Hapus gambar galeri
// @route   DELETE /api/gallery/:id
// @access  Admin
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const imageToDelete = await Gallery.findById(id);
  if (!imageToDelete) {
    res.status(404);
    throw new Error("Gambar tidak ditemukan");
  }

  await deleteFromCloudinary(imageToDelete.src);

  await imageToDelete.deleteOne();

  res.status(200).json({ message: "Gambar berhasil dihapus" });
});
