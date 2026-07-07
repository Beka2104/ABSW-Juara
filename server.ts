import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable large payloads for full database syncs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Lazy initialised Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in your environment variables. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure database directory exists
async function ensureDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // Seed with initial seed data from our source folder
      // Since src/data.ts is TS, we hardcode a minimal standard seed here just in case,
      // but in real run we will dynamically write it from client if needed.
      const initialSeed = {
        extracurriculars: [],
        students: [],
        coaches: [],
        supervisors: [],
        sops: [],
        schedules: [],
        attendance: [],
        competitions: [],
        assessments: [],
        evaluations: [],
        meetings: [],
        documents: [],
        notifications: [],
        auditLogs: [],
      };
      await fs.writeFile(DB_FILE, JSON.stringify(initialSeed, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error setting up database directories:", err);
  }
}

// API Routes
app.get("/api/data", async (req, res) => {
  try {
    await ensureDb();
    const rawData = await fs.readFile(DB_FILE, "utf-8");
    res.json(JSON.parse(rawData));
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read database state", details: error.message });
  }
});

app.post("/api/data", async (req, res) => {
  try {
    await ensureDb();
    const newData = req.body;
    await fs.writeFile(DB_FILE, JSON.stringify(newData, null, 2), "utf-8");
    res.json({ success: true, message: "Database updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to write database state", details: error.message });
  }
});

app.post("/api/assistant", async (req, res) => {
  try {
    const { prompt, dbState } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Attempt to obtain Gemini API client
    let client: GoogleGenAI;
    try {
      client = getGeminiClient();
    } catch (apiError: any) {
      // If API key is missing, provide a friendly instructional error instead of crashing
      return res.status(400).json({
        error: "GEMINI_API_KEY_MISSING",
        message: "Kunci API Gemini (GEMINI_API_KEY) tidak ditemukan di Secrets. Harap tambahkan kunci API Anda melalui menu 'Settings > Secrets' di pojok kiri bawah Google AI Studio untuk mengaktifkan asisten cerdas ini."
      });
    }

    // Build context summary to keep token usage efficient while giving full school context
    const totalEkskul = dbState?.extracurriculars?.length || 0;
    const totalSiswa = dbState?.students?.length || 0;
    const totalPelatih = dbState?.coaches?.length || 0;
    const totalPembina = dbState?.supervisors?.length || 0;
    const totalLomba = dbState?.competitions?.length || 0;
    const totalPresensi = dbState?.attendance?.length || 0;

    const ekskulSummary = (dbState?.extracurriculars || []).map((e: any) => 
      `- ${e.nama} (${e.kategori}): Hari ${e.hari}, Jam ${e.jam} di ${e.tempat}. Pelatih: ${e.pelatihId}, Pembina: ${e.pembinaId}`
    ).join("\n");

    const lombaSummary = (dbState?.competitions || []).map((l: any) => 
      `- Lomba: ${l.namaLomba}, Target: ${l.target}, Tanggal: ${l.tanggal}, Hasil/Prestasi: ${l.prestasi || "Belum Pengumuman"}`
    ).join("\n");

    const systemInstruction = `Anda adalah Asisten Kecerdasan Buatan Resmi (AEMS AI Assistant) untuk SMAIT As-Syifa Boarding School Wanareja, Subang, Jawa Barat.
Tugas Anda adalah membantu Koordinator Ekstrakurikuler mengelola program ekstrakurikuler pesantren, menganalisis kehadiran santri, merekomendasikan perlombaan, menyusun rencana/laporan mingguan, mengevaluasi kinerja pelatih, memberikan saran perbaikan, serta memberikan saran-saran Islami yang konstruktif dan taktis.

Berikut ringkasan telemetry data terkini dari sistem:
- Jumlah Ekstrakurikuler: ${totalEkskul}
- Jumlah Siswa Aktif: ${totalSiswa}
- Jumlah Pelatih: ${totalPelatih}
- Jumlah Pembina: ${totalPembina}
- Jumlah Keikutsertaan Lomba: ${totalLomba}
- Jumlah Rekaman Presensi: ${totalPresensi}

Daftar Ekstrakurikuler Saat Ini:
${ekskulSummary}

Daftar Perlombaan Saat Ini:
${lombaSummary}

Aturan Respons Anda:
1. Berikan jawaban dalam bahasa Indonesia yang sangat ramah, santun, profesional, dan memiliki nuansa khas sekolah boarding Islam / kepesantrenan (seperti menyapa dengan 'Ustadz'/'Ustadzah' atau mengucapkan salam/hamdalah jika relevan, tapi tetap lugas dan objektif).
2. Jika diminta membuat laporan, gunakan struktur markdown yang sangat terorganisir, siap cetak (printable).
3. Jika ditanya tentang analisis kehadiran atau rekomendasi target, analisis data yang kami berikan di atas dengan logis dan presisi. Jangan mengarang data siswa atau ekskul di luar dari database di atas, kecuali untuk contoh ilustrasi yang ditandai dengan jelas.
4. Jangan menyebutkan hal-hal teknis internal seperti API key, Express, Next.js, port 3000, JSON, atau folder file. Fokus sepenuhnya pada hasil manajerial sekolah.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Mohon maaf, saya gagal memproses jawaban. Silakan coba kirim kembali.";
    res.json({ reply });

  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    res.status(500).json({ error: "Gagal berkomunikasi dengan Gemini AI", details: error.message });
  }
});

// OTP In-Memory Cache: { phone: { otp: string, userId: string, expiresAt: number } }
const otpCache = new Map<string, { otp: string, userId: string, expiresAt: number }>();

app.post("/api/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Nomor HP diperlukan" });

    await ensureDb();
    const rawData = await fs.readFile(DB_FILE, "utf-8");
    const db = JSON.parse(rawData);

    // Clean phone number input
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    // Search user by phone number
    let matchedUserId: string | null = null;
    let matchedUserName: string | null = null;

    // Search in students
    const student = db.students.find((s: any) => s.noHpOrtu.replace(/[^0-9+]/g, "") === cleanPhone);
    if (student) { matchedUserId = student.id; matchedUserName = student.nama; }
    
    // Search in coaches
    if (!matchedUserId) {
      const coach = db.coaches.find((c: any) => c.noHp.replace(/[^0-9+]/g, "") === cleanPhone);
      if (coach) { matchedUserId = coach.id; matchedUserName = coach.nama; }
    }

    // Search in supervisors
    if (!matchedUserId) {
      const supervisor = db.supervisors.find((p: any) => p.kontak.replace(/[^0-9+]/g, "") === cleanPhone);
      if (supervisor) { matchedUserId = supervisor.id; matchedUserName = supervisor.nama; }
    }

    if (!matchedUserId) {
      return res.status(404).json({ error: "Nomor HP tidak ditemukan di database" });
    }

    // Find the actual user account that has this linkedEntityId
    const userAcc = (db.users || []).find((u: any) => u.linkedEntityId === matchedUserId);
    if (!userAcc) {
      return res.status(404).json({ error: "Akun login untuk pengguna ini belum dibuat" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in cache for 5 minutes
    otpCache.set(cleanPhone, { 
      otp, 
      userId: userAcc.id, 
      expiresAt: Date.now() + 5 * 60 * 1000 
    });

    // TODO: Connect to real API here (e.g. Fonnte or Twilio)
    // Example (Fonnte):
    // await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: "YOUR_TOKEN" }, body: new URLSearchParams({ target: cleanPhone, message: `Kode OTP ABSW Juara Anda adalah: ${otp}` }) });
    
    console.log(`\n=========================================`);
    console.log(`[MOCK SMS/WA] Mengirim OTP ke ${cleanPhone}`);
    console.log(`Halo ${matchedUserName}, kode OTP Anda adalah: ${otp}`);
    console.log(`=========================================\n`);

    res.json({ success: true, message: "OTP berhasil dikirim" });
  } catch (error: any) {
    res.status(500).json({ error: "Gagal mengirim OTP", details: error.message });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    
    const record = otpCache.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ error: "OTP tidak ditemukan atau sudah kadaluarsa" });
    }
    
    if (Date.now() > record.expiresAt) {
      otpCache.delete(cleanPhone);
      return res.status(400).json({ error: "Kode OTP sudah kadaluarsa" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Kode OTP salah" });
    }

    // Verify success, keep record for resetting password
    res.json({ success: true, message: "OTP valid" });
  } catch (error: any) {
    res.status(500).json({ error: "Gagal memverifikasi OTP", details: error.message });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    const record = otpCache.get(cleanPhone);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: "Sesi OTP tidak valid, mohon ulangi" });
    }

    await ensureDb();
    const rawData = await fs.readFile(DB_FILE, "utf-8");
    const db = JSON.parse(rawData);

    let updated = false;
    db.users = (db.users || []).map((u: any) => {
      if (u.id === record.userId) {
        updated = true;
        return { ...u, password: newPassword };
      }
      return u;
    });

    if (updated) {
      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      otpCache.delete(cleanPhone); // Clear cache
      res.json({ success: true, message: "Kata sandi berhasil direset" });
    } else {
      res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Gagal mereset kata sandi", details: error.message });
  }
});

// Setup development and production serving
async function start() {
  await ensureDb();

  if (process.env.NODE_ENV !== "production") {
    // In dev mode, use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AEMS Server] Running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start AEMS Full-Stack Server:", err);
});
