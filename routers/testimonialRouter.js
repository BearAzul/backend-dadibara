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

// Rute untuk publik dan user
router
  .route("/")
  .get(getTestimonials)
  .post(protectedMiddleware, createTestimonial);

// Rute khusus admin
router.get(
  "/admin",
  protectedMiddleware,
  roleMiddleware("admin", "superAdmin"),
  getAllTestimonialsAdmin
);
router.patch(
  "/:id/archive",
  protectedMiddleware,
  roleMiddleware("admin", "superAdmin"),
  toggleArchiveTestimonial
);

export default router;
