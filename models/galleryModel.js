// models/GalleryModel.js
import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
