import express from "express";
import mongoSanitize from "express-mongo-sanitize";

const app = express();
const port = 5001; // Kita gunakan port yang berbeda

// Hanya gunakan middleware yang paling penting untuk tes
app.use(express.json());
app.use(mongoSanitize()); // Menggunakan cara yang benar

// Membuat satu rute sederhana
app.get("/", (req, res) => {
  res.send("Server Tes Berhasil!");
});

app.listen(port, () => {
  console.log(`Server tes berjalan di http://localhost:${port}`);
});