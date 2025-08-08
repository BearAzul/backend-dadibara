console.log(
  "--- SERVER MENJALANKAN di Waktu " + new Date().toLocaleTimeString() + " ---"
);

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ROUTES
import userRouter from "./routers/userRouter.js";
import testimonialRoutes from "./routers/testimonialRouter.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import landingConfigRoutes from "./routers/landingConfigRoutes.js";
import jadwalKegiatanRoutes from "./routers/jadwalKegiatanRoutes.js";
import faqRoutes from "./routers/faqRoutes.js";
import galleryRouter from "./routers/galleryRouter.js";
import keuanganRouter from "./routers/keuanganRouter.js";
import memberRoutes from "./routers/memberRoute.js";
import skRouter from "./routers/skRouter.js";
import pendaftaranRouter from "./routers/pendaftaranRouter.js";

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cookieParser());
app.use(
  cors({
    process.env.NODE_ENV === "production"
        ? process.env.VERCEL_URL
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Sanitize input
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(Object.assign({}, req.query));
  next();
});

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/landing-config", landingConfigRoutes);
app.use("/api/jadwal-kegiatan", jadwalKegiatanRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/gallery", galleryRouter);
app.use("/api/keuangan", keuanganRouter);
app.use("/api/members", memberRoutes);
app.use("/api/sk", skRouter);
// ...
app.use("/api/pendaftaran", pendaftaranRouter);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Server & DB
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Berlari di http://localhost:${port}`);
  });
}

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("Terhubung Database"))
  .catch((err) => console.error("Koneksi Database GAGAL:", err));

export default app;
