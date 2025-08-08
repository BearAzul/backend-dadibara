// routers/skRouter.js
import express from "express";
import { getSkDocument, uploadSk } from "../controllers/skController.js";
import upload from "../utils/upload.js";
import {
  protectedMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getSkDocument)
  .post(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    (req, res, next) => {
      req.uploadFolder = "sk-dokumen";
      next();
    },
    upload.single("sk_document"),
    uploadSk
  );

export default router;
