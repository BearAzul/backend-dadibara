import express from "express";
import {
  getMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";
import upload from "../utils/upload.js";
import {
  protectedMiddleware,
  roleMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getMembers)
  .post(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    upload.single("foto"),
    createMember
  );

router.route("/").post(
  protectedMiddleware,
  adminMiddleware,
  (req, res, next) => {
    // Folder dinamis, sesuai dengan nama member
    req.uploadFolder = `karang-taruna-uploads/${req.body.nama.toLowerCase().replace(/\s/g, "-")}`;
    next();
  },
  upload.single("foto"),
  createMember
);

router
  .route("/:id")
  .get(getMemberById)
  .put(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    upload.single("foto"),
    updateMember
  )
  .delete(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    deleteMember
  );

export default router;
