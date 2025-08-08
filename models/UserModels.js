// models/UserModels.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true, // Role akan selalu diisi oleh controller
      enum: ["superAdmin", "admin", "user"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      required: [true, "Nama lengkap harus diisi"],
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true, // Dihapus pesan custom agar error handler bisa menangani
      validate: {
        validator: validator.isEmail,
        message: "Format harus youremail@gmail.com",
      },
    },
    gender: {
      type: String,
      enum: ["Laki-laki", "Perempuan", ""],
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      minLength: [8, "Password minimal 8 karakter"],
    },
    verificationCode: String,
    verificationExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
