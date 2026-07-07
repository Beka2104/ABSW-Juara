import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, UserPlus, User, Phone, Home, BookOpen, CheckCircle2, Lock, Compass, ArrowRight, Sparkles, Info, X, Target, Landmark, Monitor } from "lucide-react";
import { AppDatabase, Student, Role } from "../types";

interface LoginViewProps {
  database: AppDatabase;
  onLogin: (role: Role, studentId?: string, studentName?: string) => void;
  onRegister: (entityData: any, role: Role, password?: string) => void;
}

export default function LoginView({
  database,
  onLogin,
  onRegister
}: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration States
  const [regRole, setRegRole] = useState<"Siswa" | "Pelatih" | "Pembina Ekstrakurikuler">("Siswa");
  const [regName, setRegName] = useState("");
  const [regClass, setRegClass] = useState("X-A IPA");
  const [regDorm, setRegDorm] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSkill, setRegSkill] = useState("");
  const [regPosition, setRegPosition] = useState("");

  const classOptions = [
    "X-A IPA", "X-B IPA", "X-C IPS", "X-D IPS",
    "XI-A IPA", "XI-B IPA", "XI-C IPS", "XI-D IPS",
    "XII-A IPA", "XII-B IPA", "XII-C IPS", "XII-D IPS"
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setErrorMsg("Nama pengguna atau email wajib diisi.");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("Kata sandi wajib diisi.");
      return;
    }

    const usersList = database.users || [];
    const cleanInput = loginUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

    const matchedUser = usersList.find(
      (u) =>
        u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
        u.nama.toLowerCase() === loginUsername.trim().toLowerCase() ||
        u.username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === cleanInput ||
        u.nama.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === cleanInput
    );

    if (matchedUser) {
      if (matchedUser.password === loginPassword) {
        setSuccessMsg(`Marhaban, Ahlan wa Sahlan ${matchedUser.nama}!`);
        setErrorMsg(null);
        setTimeout(() => {
          onLogin(matchedUser.role, matchedUser.linkedEntityId, matchedUser.nama);
        }, 1500);
        return;
      } else {
        setErrorMsg("Kata sandi yang Anda masukkan salah.");
        return;
      }
    }

    const student = database.students.find(
      (s) =>
        s.nama.toLowerCase() === loginUsername.trim().toLowerCase() ||
        s.nama.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === cleanInput
    );

    if (student) {
      if (loginPassword === "siswa123" || loginPassword === "" || loginPassword === "siswa") {
        setSuccessMsg(`Marhaban, Ahlan wa Sahlan ${student.nama}!`);
        setErrorMsg(null);
        setTimeout(() => {
          onLogin("Siswa", student.id, student.nama);
        }, 1500);
        return;
      } else {
        setErrorMsg("Kata sandi salah untuk santri ini. Gunakan password 'siswa123' atau kosong.");
        return;
      }
    }

    const coach = database.coaches.find(
      (c) =>
        c.nama.toLowerCase() === loginUsername.trim().toLowerCase() ||
        c.nama.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === cleanInput
    );

    if (coach) {
      if (loginPassword === "pelatih123" || loginPassword === "" || loginPassword === "pelatih") {
        setSuccessMsg(`Marhaban, Ahlan wa Sahlan ${coach.nama}!`);
        setErrorMsg(null);
        setTimeout(() => {
          onLogin("Pelatih", coach.id, coach.nama);
        }, 1500);
        return;
      } else {
        setErrorMsg("Kata sandi salah untuk Pelatih ini.");
        return;
      }
    }

    const supervisor = database.supervisors.find(
      (p) =>
        p.nama.toLowerCase() === loginUsername.trim().toLowerCase() ||
        p.nama.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === cleanInput
    );

    if (supervisor) {
      if (loginPassword === "pembina123" || loginPassword === "" || loginPassword === "pembina") {
        setSuccessMsg(`Marhaban, Ahlan wa Sahlan ${supervisor.nama}!`);
        setErrorMsg(null);
        setTimeout(() => {
          onLogin("Pembina Ekstrakurikuler", supervisor.id, supervisor.nama);
        }, 1500);
        return;
      } else {
        setErrorMsg("Kata sandi salah untuk Pembina ini.");
        return;
      }
    }

    setErrorMsg("Nama pengguna tidak ditemukan. Silakan hubungi Admin atau daftar akun baru.");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { setErrorMsg("Nama lengkap wajib diisi."); return; }
    if (regRole === "Siswa" && !regDorm.trim()) { setErrorMsg("Kamar & Gedung Asrama wajib diisi."); return; }
    if (!regPhone.trim()) { setErrorMsg("Nomor HP wajib diisi."); return; }
    if (regRole === "Pelatih" && !regSkill.trim()) { setErrorMsg("Keahlian & Lisensi wajib diisi."); return; }
    if (regRole === "Pembina Ekstrakurikuler" && !regPosition.trim()) { setErrorMsg("Jabatan wajib diisi."); return; }
    if (!regPassword) { setErrorMsg("Kata sandi baru wajib dibuat."); return; }
    if (regPassword.length < 5) { setErrorMsg("Kata sandi minimal 5 karakter."); return; }

    let newEntity: any = {};
    const newId = `${regRole === "Siswa" ? "std" : regRole === "Pelatih" ? "coach" : "spv"}-${Date.now()}`;

    if (regRole === "Siswa") {
      newEntity = {
        id: newId,
        nama: regName.trim(),
        kelas: regClass,
        asrama: regDorm.trim(),
        noHpOrtu: regPhone.trim(),
        ekskulIds: [],
        riwayat: [
          {
            tanggal: new Date().toISOString().substring(0, 10),
            kegiatan: "Registrasi Portal ABSW Juara",
            keterangan: "Bergabung secara resmi di portal."
          }
        ]
      };
    } else if (regRole === "Pelatih") {
      newEntity = {
        id: newId,
        nama: regName.trim(),
        keahlian: regSkill.trim(),
        noHp: regPhone.trim(),
        email: "",
        honor: 1000000,
        status: "Aktif",
        riwayatMengajar: []
      };
    } else if (regRole === "Pembina Ekstrakurikuler") {
      newEntity = {
        id: newId,
        nama: regName.trim(),
        jabatan: regPosition.trim(),
        kontak: regPhone.trim(),
        ekskulBinaan: []
      };
    }

    setSuccessMsg(`Pendaftaran berhasil! Selamat bergabung ${newEntity.nama}.`);
    setErrorMsg(null);
    setTimeout(() => {
      onRegister(newEntity, regRole, regPassword);
      onLogin(regRole, newEntity.id, newEntity.nama);
    }, 2000);
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 text-sm bg-surface-sunken border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-200 transition-all";
  const labelClass = "block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen w-full bg-surface-sunken flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon-100/30 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-100/30 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* Left Side — Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-maroon-500 via-maroon-600 to-maroon-700 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-xl">
                <Landmark className="text-gold-500" size={24} />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-base tracking-tight text-gold-400">
                  ABSW JUARA
                </h1>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest">
                  SMAIT As-Syifa Boarding School
                </p>
              </div>
            </div>

            <h2 className="text-3xl md:text-[2.5rem] font-display font-extrabold leading-[1.15] tracking-tight text-white">
              Portal Digital<br />
              <span className="text-gold-400">Ekstrakurikuler</span><br />
              & Aktivitas Santri
            </h2>

            <p className="text-white/50 text-xs leading-relaxed mt-5 max-w-xs">
              Presensi GPS, dokumentasi SOP, penilaian, dan rekapitulasi prestasi dalam satu platform terintegrasi.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8 max-w-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <Target className="text-gold-400" size={20} />
                <p className="text-[11px] font-bold text-white mt-1.5">Sunnah Rasulullah</p>
                <p className="text-[9px] text-white/40 mt-0.5">Panahan, berkuda, & bela diri</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <Monitor className="text-maroon-400" size={20} />
                <p className="text-[11px] font-bold text-white mt-1.5">Sains & IoT</p>
                <p className="text-[9px] text-white/40 mt-0.5">Robotik, koding, olimpiade</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-white/30 text-[10px] font-mono relative z-10">
            <span>WANAREJA • SUBANG</span>
            <span className="text-gold-500 font-bold">ABSW v3.0</span>
          </div>
        </div>

        {/* Right Side — Forms */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">

          {/* Tab Switcher */}
          <div className="flex p-1 bg-surface-sunken rounded-xl mb-8 border border-border">
            <button
              onClick={() => { setActiveTab("login"); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-white text-maroon-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LogIn size={14} />
              Masuk Portal
            </button>
            <button
              onClick={() => { setActiveTab("register"); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-white text-maroon-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserPlus size={14} />
              Daftar Akun Baru
            </button>
          </div>

          {/* Feedback */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 p-3.5 rounded-xl bg-navy-50 border border-navy-100 text-navy-500 text-xs flex items-start gap-2.5"
              >
                <Info size={15} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Perhatian</p>
                  <p className="mt-0.5 text-navy-500">{errorMsg}</p>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-navy-400 hover:text-navy-500 text-sm font-bold">×</button>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 p-3.5 rounded-xl bg-maroon-50 border border-maroon-100 text-maroon-600 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-maroon-400" />
                <div className="flex-1">
                  <p className="font-semibold">Alhamdulillah</p>
                  <p className="mt-0.5 text-maroon-500">{successMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h3 className="font-display font-extrabold text-xl text-slate-800">Selamat Datang Kembali</h3>
                <p className="text-xs text-slate-400 mt-1">Masukkan nama lengkap atau akun koordinasi Anda.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Nama Pengguna / Nama Santri</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400"><User size={14} /></span>
                    <input
                      type="text"
                      placeholder="Contoh: Muhammad Zaki Al-Fatih"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Kata Sandi</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400"><Lock size={14} /></span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-1.5 text-slate-500">
                    <input type="checkbox" defaultChecked className="rounded text-maroon-500 accent-maroon-500" />
                    <span>Ingat Akun Saya</span>
                  </label>
                  <button type="button" className="text-gold-600 hover:underline font-semibold">Lupa Sandi?</button>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-maroon-500 hover:bg-maroon-500 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  Masuk ke Dashboard
                  <ArrowRight size={14} />
                </button>
              </form>
              <div className="mt-8 pt-5 border-t border-border text-center">
                <p className="text-[11px] text-slate-400 italic">
                  Hubungi Koordinator Ekstrakurikuler untuk pembuatan akun Pelatih/Pembina/Kepsek baru.
                </p>
              </div>
            </motion.div>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[75vh] overflow-y-auto pr-1"
            >
              <div className="mb-6">
                <h3 className="font-display font-extrabold text-xl text-maroon-600">Pendaftaran Akun Baru</h3>
                <p className="text-xs text-slate-400 mt-1">Masukkan identitas lengkap untuk mendaftarkan akun baru.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" checked={regRole === "Siswa"} onChange={() => setRegRole("Siswa")} className="accent-maroon-500" />
                    Siswa
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" checked={regRole === "Pelatih"} onChange={() => setRegRole("Pelatih")} className="accent-maroon-500" />
                    Pelatih
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" checked={regRole === "Pembina Ekstrakurikuler"} onChange={() => setRegRole("Pembina Ekstrakurikuler")} className="accent-maroon-500" />
                    Pembina
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={regRole !== "Siswa" ? "col-span-2 sm:col-span-1" : ""}>
                    <label className={labelClass}>Nama Lengkap</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><User size={14} /></span>
                      <input type="text" required placeholder="Nama Lengkap Anda" value={regName} onChange={(e) => setRegName(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  {regRole === "Siswa" && (
                    <div>
                      <label className={labelClass}>Kelas</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Compass size={14} /></span>
                        <select value={regClass} onChange={(e) => setRegClass(e.target.value)} className={inputClass + " cursor-pointer"}>
                          {classOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                    </div>
                  )}
                  {regRole === "Pelatih" && (
                    <div>
                      <label className={labelClass}>Keahlian & Lisensi</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><BookOpen size={14} /></span>
                        <input type="text" required placeholder="Contoh: Pelatih Panahan" value={regSkill} onChange={(e) => setRegSkill(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}
                  {regRole === "Pembina Ekstrakurikuler" && (
                    <div>
                      <label className={labelClass}>Jabatan Guru / Staff</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Landmark size={14} /></span>
                        <input type="text" required placeholder="Contoh: Wakasek Kesiswaan" value={regPosition} onChange={(e) => setRegPosition(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {regRole === "Siswa" && (
                    <div>
                      <label className={labelClass}>Gedung & Kamar Asrama</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Home size={14} /></span>
                        <input type="text" required placeholder="Gdg Shalahuddin Kamar 5" value={regDorm} onChange={(e) => setRegDorm(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}
                  <div className={regRole !== "Siswa" ? "col-span-2 sm:col-span-2" : ""}>
                    <label className={labelClass}>{regRole === "Siswa" ? "No. HP Orang Tua" : "Nomor HP Kontak"}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Phone size={14} /></span>
                      <input type="tel" required placeholder="+62812345678" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Kata Sandi Baru</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Lock size={14} /></span>
                    <input type="password" required placeholder="Minimal 5 karakter" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-maroon-500 hover:bg-maroon-500 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  Daftarkan & Masuk Portal
                  <ArrowRight size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
