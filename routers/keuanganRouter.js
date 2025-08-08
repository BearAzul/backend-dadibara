import express from "express";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/keuanganController.js";
import upload from "../utils/upload.js"; // Middleware Multer
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectedMiddleware, adminMiddleware, getTransactions)
  .post(
    protectedMiddleware,
    adminMiddleware,
    (req, res, next) => {
      req.uploadFolder = "keuangan-dokumen";
      next();
    },
    upload.single("document"),
    createTransaction
  );

router
  .route("/:id")
  .put(
    protectedMiddleware,
    adminMiddleware,
    (req, res, next) => {
      req.uploadFolder = "keuangan-dokumen";
      next();
    },
    upload.single("document"),
    updateTransaction
  )
  .delete(protectedMiddleware, adminMiddleware, deleteTransaction);

export default router;
