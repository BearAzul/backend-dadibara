import User from "../models/UserModels.js";
import Member from "../models/memberModel.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendEmailVerify } from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";
import Testimonial from "../models/TestimonialModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id, role) => {
  const expiresIn = role === "admin" || role === "superAdmin" ? "30m" : "60m";

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

const createSendResToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    user: user,
  });
};

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const folderName = req.uploadFolder || "karang-taruna-uploads";

    let stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

export const registerRequest = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    res.status(400);
    throw new Error("Semua kolom wajib diisi.");
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Password dan Konfirmasi Password tidak cocok.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    if (userExists.isVerified) {
      res.status(400);
      throw new Error("Email sudah terdaftar. Silakan Login.");
    } else {
      res.status(400);
      throw new Error(
        "Email ini sudah didaftarkan tapi belum diverifikasi. Silakan gunakan fitur 'Kirim Ulang Kode'."
      );
    }
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 menit

  const newUser = await User.create({
    fullName,
    phone,
    email,
    password,
    verificationCode,
    verificationExpires,
    isVerified: false,
    role: "user",
  });

  await sendEmailVerify(newUser.email, verificationCode);

  res.status(201).json({
    message: `Pendaftaran berhasil. Kode verifikasi telah dikirim ke ${newUser.email}.`,
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, given_name, family_name, picture } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    const totalUsers = await User.countDocuments();
    let role;
    if (totalUsers === 0) {
      role = "superAdmin";
    } else {
      role = "user";
    }

    user = await User.create({
      fullName: `${given_name} ${family_name || ""}`.trim(),
      email,
      password: Math.random().toString(36).slice(-8),
      isVerified: true,
      profilePicture: picture,
      role: role,
    });
  }

  createSendResToken(user, 200, res);
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  const user = await User.findOne({
    email,
    verificationCode,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Kode verifikasi tidak valid atau sudah kedaluwarsa.");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();

  createSendResToken(user, 200, res);
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email wajib diisi.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Email yang Anda masukkan tidak terdaftar.");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("Akun ini sudah aktif. Silakan langsung login.");
  }

  user.verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationExpires = Date.now() + 10 * 60 * 1000; // Beri waktu 10 menit

  await user.save();

  await sendEmailVerify(user.email, user.verificationCode);

  res.status(200).json({
    message: `Kode verifikasi baru telah berhasil dikirim ke ${user.email}.`,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email/Password tidak boleh kosong");
  }

  const userData = await User.findOne({ email });

  if (!userData || !(await userData.comparePassword(password))) {
    res.status(401);
    throw new Error("Email atau Password tidak sesuai");
  }

  if (userData.role === "user" && !userData.isVerified) {
    res.status(403);
    throw new Error("Akun Anda belum diverifikasi. Silakan cek email Anda.");
  }

  // 3. Jika semua lolos, baru berikan token
  createSendResToken(userData, 200, res);
});

export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalSuperAdmins = await User.countDocuments({ role: "superAdmin" });
  const totalPengurus = await Member.countDocuments();

  res.status(200).json({
    totalUsers,
    totalAdmins,
    totalSuperAdmins,
    totalPengurus,
  });
});

export const getAdminData = asyncHandler(async (req, res) => {
  // Fungsi ini hanya boleh diakses oleh superAdmin
  if (req.user.role !== "superAdmin") {
    res.status(403);
    throw new Error("Akses ditolak. Hanya Super Admin yang diizinkan.");
  }

  const superAdmins = await User.find({ role: "superAdmin" }).select(
    "-password"
  );
  const admins = await User.find({ role: "admin" }).select("-password");

  res.status(200).json({ superAdmins, admins });
});

export const getManagementUsers = asyncHandler(async (req, res) => {
  // Ambil semua user dengan peran 'admin' atau 'superAdmin'
  // dan hilangkan password dari data yang dikirim
  const superAdmins = await User.find({ role: "superAdmin" }).select(
    "-password"
  );
  const admins = await User.find({ role: "admin" }).select("-password");

  res.status(200).json({ superAdmins, admins });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && user.role === "admin") {
    await user.deleteOne();
    res.status(200).json({ message: "Admin berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Admin tidak ditemukan");
  }
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (admin && admin.role === "admin") {
    admin.fullName = req.body.fullName || admin.fullName;

    // Hanya update password jika dikirim dan tidak kosong
    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    updatedAdmin.password = undefined;
    res.status(200).json(updatedAdmin);
  } else {
    res.status(404);
    throw new Error("Admin tidak ditemukan");
  }
});

// Tambah admin baru (hanya superAdmin)
export const createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  // (Tambahkan validasi lain jika perlu, misal cek email duplikat)
  const newAdmin = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "admin",
  });
  newAdmin.password = undefined;
  res.status(201).json(newAdmin);

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email sudah digunakan.");
  }
});

export const getUser = asyncHandler(async (req, res) => {
  console.log("BACKEND: Masuk ke controller getUser.");
  const user = await User.findById(req.user._id).select("-password").lean();
  if (user) {
    const existingTestimonial = await Testimonial.findOne({ user: user._id });

    user.hasSubmittedTestimonial = !!existingTestimonial;

    return res.status(200).json({
      user,
    });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(200).json({ users });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender;
    user.address = req.body.address;

    if (req.file) {
      const result = await streamUpload(req);
      user.profilePicture = result.secure_url;
    }

    if (req.body.oldPassword && req.body.password) {
      const isMatch = await user.comparePassword(req.body.oldPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Kata Sandi Lama yang Anda masukkan salah.");
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({ user: updatedUser });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  // Pastikan user ada dan perannya adalah 'user'
  if (user && user.role === "user") {
    await user.deleteOne();
    res.status(200).json({ message: "Pengguna berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Pengguna tidak ditemukan atau bukan role user");
  }
});

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  console.log("BACKEND: Pengguna berhasil logout.");
  res.status(200).json({ message: "Logout berhasil" });
};
