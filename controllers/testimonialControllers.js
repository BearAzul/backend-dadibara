import Testimonial from "../models/TestimonialModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Mengambil semua testimoni publik (yang tidak diarsipkan)
// @route   GET /api/testimonials
// @access  Publik
export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isArchived: false })
    .populate("user", "fullName profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({ testimonials });
});

// @desc    Membuat testimoni baru
// @route   POST /api/testimonials
// @access  Private (butuh login)
export const createTestimonial = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  const existingTestimonial = await Testimonial.findOne({ user: req.user._id });

  if (existingTestimonial) {
    res.status(400);
    throw new Error("Anda sudah pernah memberikan testimoni.");
  }

  const testimonial = new Testimonial({
    message,
    rating,
    user: req.user._id,
  });

  const createdTestimonial = await testimonial.save();
  await createdTestimonial.populate("user", "fullName profilePicture");

  res.status(201).json({ testimonial: createdTestimonial });
}); // <-- FUNGSI createTestimonial SELESAI DI SINI

// ▼▼▼ FUNGSI-FUNGSI DI BAWAH INI SEHARUSNYA BERADA DI LUAR ▼▼▼

// @desc    Mengambil SEMUA testimoni untuk admin
// @route   GET /api/testimonials/admin
// @access  Admin
export const getAllTestimonialsAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({}) // Tanpa filter
    .populate("user", "fullName profilePicture")
    .sort({ createdAt: -1 });
  res.status(200).json({ testimonials });
});

// @desc    Mengubah status arsip (archive/un-archive)
// @route   PATCH /api/testimonials/:id/archive
// @access  Admin
export const toggleArchiveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (testimonial) {
    testimonial.isArchived = !testimonial.isArchived; // Balikkan nilainya
    await testimonial.save();
    res.status(200).json({ message: "Status testimoni berhasil diubah." });
  } else {
    res.status(444);
    throw new Error("Testimoni tidak ditemukan.");
  }
});
