import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Map mime type ke format file
const mimeTypeMap = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folderName = req.uploadFolder || "karang-taruna-uploads";
    const format = mimeTypeMap[file.mimetype] || "jpg";

    const publicId = `${folderName.split("/").pop()}-${file.originalname.split(".")[0]}-${Date.now()}`;

    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';

    return {
      folder: folderName,
      format: format,
      public_id: publicId,
      resource_type: resourceType,
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 6 * 1024 * 1024, // Batas ukuran file: 6MB
  },
});

export default upload;
