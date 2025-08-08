import express from "express";
import {
  getTestimonials,
  createTestimonial,
  getAllTestimonialsAdmin,
  toggleArchiveTestimonial,
} from "../controllers/testimonialControllers.js";
import {
  protectedMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getTestimonials)
  .post(protectedMiddleware, createTestimonial);

router.post(
  "/",
  protectedMiddleware,
  roleMiddleware("user"),
  createTestimonial
);

// Rute untuk admin mengambil semua testimoni
router.get('/admin', protectedMiddleware, roleMiddleware('admin', 'superAdmin'), getAllTestimonialsAdmin);

// Rute untuk admin mengarsipkan testimoni
router.patch('/:id/archive', protectedMiddleware, roleMiddleware('admin', 'superAdmin'), toggleArchiveTestimonial);

export default router;
