
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendEmailVerify = async (email, verificationCode) => {

  const mailOptions = {
    from: `"DADI BARA" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Silahkan Verifikasi Alamat Email Anda!",
    html: `Kode Anda: ${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error("Gagal mengirim kode verifikasi email");
  }
};
