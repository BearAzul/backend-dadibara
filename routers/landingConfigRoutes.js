// routers/landingConfigRoutes.js
import express from "express";
import {
  getLandingConfig,
  updateLandingConfig,
} from "../controllers/landingConfigController.js";
import upload from "../utils/upload.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getLandingConfig)
  .put(
    protectedMiddleware,
    adminMiddleware,
    (req, res, next) => {
      req.uploadFolder = "landing-page-logos";
      next();
    },
    upload.fields([
      { name: "logoDadiBara", maxCount: 1 },
      { name: "logoDesaBaru", maxCount: 1 },
    ]),
    updateLandingConfig
  );

export default router;
