// models/JadwalKegiatanModel.js
import mongoose from "mongoose";

const jadwalKegiatanSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  tempat: { type: String, required: true },
  tanggal: { type: Date, required: true },
  waktu: { type: String, required: true },
  keterangan: String,
});

const JadwalKegiatan = mongoose.model("JadwalKegiatan", jadwalKegiatanSchema);
export default JadwalKegiatan;
