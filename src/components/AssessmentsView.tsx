import React, { useState, useEffect } from "react";
import {
  Award,
  TrendingUp,
  FileText,
  Check,
  Star,
  User,
  BookOpen,
  Printer,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppDatabase, Assessment, Evaluation, Role } from "../types";

interface AssessmentsViewProps {
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
  initialTab?: "penilaian" | "raport" | "evaluasi";
}

export default function AssessmentsView({ database, setDatabase, currentRole, initialTab }: AssessmentsViewProps) {
  const [activeTab, setActiveTab] = useState<"penilaian" | "raport" | "evaluasi">(initialTab || "penilaian");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(database.students[0]?.id || "");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Grading form states
  const [gradeStudentId, setGradeStudentId] = useState("");
  const [gradeEkskulId, setGradeEkskulId] = useState("");
  const [scoreAbsen, setScoreAbsen] = useState(85);
  const [scoreAktif, setScoreAktif] = useState(80);
  const [scoreSkill, setScoreSkill] = useState(85);
  const [scoreSikap, setScoreSikap] = useState(90);

  // Evaluation form states
  const [evalCoachId, setEvalCoachId] = useState("");
  const [evalScore, setEvalScore] = useState(5);
  const [evalFeedback, setEvalFeedback] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Recharts Progress Mock data
  const trendData = [
    { semester: "Sem 1 2024", score: 72 },
    { semester: "Sem 2 2024", score: 78 },
    { semester: "Sem 1 2025", score: 84 },
    { semester: "Sem 2 2025", score: 81 },
    { semester: "Sem 1 2026", score: 88 }
  ];

  // Grade allocator logic
  const calculateGrade = (avg: number): string => {
    if (avg >= 88) return "A (Sangat Baik)";
    if (avg >= 78) return "B (Baik)";
    if (avg >= 65) return "C (Cukup)";
    return "D (Kurang)";
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeStudentId || !gradeEkskulId) {
      triggerAlert("Harap lengkapi nama santri dan ekstrakurikuler.");
      return;
    }

    const studentObj = database.students.find((s) => s.id === gradeStudentId);
    if (!studentObj) return;

    const avgScore = Math.round((scoreAbsen + scoreAktif + scoreSkill + scoreSikap) / 4);
    const predikat = calculateGrade(avgScore);

    const newAssessment: Assessment = {
      id: `ass-${Date.now()}`,
      siswaId: gradeStudentId,
      namaSiswa: studentObj.nama,
      kelas: studentObj.kelas,
      ekskulId: gradeEkskulId,
      kehadiran: scoreAbsen,
      keaktifan: scoreAktif,
      keterampilan: scoreSkill,
      sikap: scoreSikap,
      nilaiAkhir: avgScore,
      predikat
    };

    const updatedDb = { ...database };
    updatedDb.assessments.unshift(newAssessment);

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: "Ust. Reza Firmansyah",
      peran: currentRole,
      aktivitas: "Input Nilai Santri",
      detail: `Memasukkan nilai raport ekskul untuk: ${studentObj.nama} (${predikat})`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Nilai Raport untuk "${studentObj.nama}" berhasil disimpan!`);
    
    // Clear forms
    setGradeStudentId("");
    setGradeEkskulId("");
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalCoachId || !evalFeedback) {
      triggerAlert("Lengkapi nama pelatih dan komentar umpan balik.");
      return;
    }

    const coachObj = database.coaches.find((c) => c.id === evalCoachId);
    if (!coachObj) return;

    const newEval: Evaluation = {
      id: `eval-${Date.now()}`,
      pemberiEvaluasi: "Wali Santri Anonim",
      peranPemberi: "Orang Tua",
      targetEvaluasiId: evalCoachId,
      targetNama: coachObj.nama,
      skorKinerja: evalScore,
      saranKritik: evalFeedback
    };

    const updatedDb = { ...database };
    updatedDb.evaluations.unshift(newEval);

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: "Orang Tua Anonim",
      peran: "Orang Tua",
      aktivitas: "Umpan Balik Pelatih",
      detail: `Mengirimkan evaluasi kinerja untuk pelatih ${coachObj.nama} (Bintang: ${evalScore})`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Umpan balik evaluasi pelatih "${coachObj.nama}" sukses diunggah secara anonim.`);
    
    setEvalCoachId("");
    setEvalFeedback("");
  };

  const handlePrintRaport = () => {
    const student = database.students.find((s) => s.id === selectedStudentId);
    const scores = database.assessments.filter((a) => a && a.siswaId === selectedStudentId);
    
    if (!student) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Raport Ekskul - ${student.nama}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 15px; margin-bottom: 30px; }
              .title { font-size: 20px; font-weight: bold; text-transform: uppercase; color: #065f46; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 13px; }
              th { background-color: #f1f5f9; }
              .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">LEMBAR HASIL PENILAIAN EKSTRAKURIKULER</div>
              <div>SMAIT AS-SYIFA BOARDING SCHOOL WANAREJA</div>
            </div>
            
            <p><strong>Nama Santri:</strong> ${student.nama} | <strong>Kelas:</strong> ${student.kelas} | <strong>Asrama:</strong> ${student.asrama}</p>

            <table>
              <thead>
                <tr>
                  <th>Ekstrakurikuler</th>
                  <th>Presensi (30%)</th>
                  <th>Keaktifan (20%)</th>
                  <th>Keterampilan (35%)</th>
                  <th>Sikap & Karakter (15%)</th>
                  <th>Nilai Rata-Rata</th>
                  <th>Predikat</th>
                </tr>
              </thead>
              <tbody>
                ${
                  scores.length > 0
                    ? scores.map((a) => {
                        const eName = database.extracurriculars.find((ek) => ek.id === a.ekskulId)?.nama || "Ekskul";
                        return `
                          <tr>
                            <td><strong>${eName}</strong></td>
                            <td>${a.kehadiran}</td>
                            <td>${a.keaktifan}</td>
                            <td>${a.keterampilan}</td>
                            <td>${a.sikap}</td>
                            <td><strong>${a.nilaiAkhir}</strong></td>
                            <td><strong>${a.predikat}</strong></td>
                          </tr>
                        `;
                      }).join("")
                    : `<tr><td colspan="7" style="text-align: center; color: #64748b;">Belum ada penilaian komprehensif di semester ini.</td></tr>`
                }
              </tbody>
            </table>

            <div class="footer">
              AEMS Digital Assessment System • SMAIT As-Syifa Boarding School Wanareja • Dicetak otomatis pada ${new Date().toLocaleDateString("id-ID")}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast simulated alerts */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-medium animate-bounce border border-border">
          <AlertCircle size={15} className="text-gold-400 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
            Penilaian & Evaluasi Pembelajaran
          </h2>
          <p className="text-xs text-gray-400">Pusat input raport, lembar nilai bimbingan, dan evaluasi kepelatihan asrama</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("penilaian")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeTab === "penilaian"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Input Penilaian Santri
        </button>
        <button
          onClick={() => setActiveTab("raport")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeTab === "raport"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Raport & Grafik Santri
        </button>
      </div>

      {/* Tab 1: Penilaian Input */}
      {activeTab === "penilaian" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rating Editor Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <BookOpen size={16} className="text-maroon-500" />
              Lembar Scoring Kompetensi
            </h3>
            
            {isReadOnly ? (
              <p className="text-xs text-navy-500 font-medium">Hanya Pembina, Pelatih, dan Admin yang memiliki hak akses menginput nilai.</p>
            ) : (
              <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Nama Santri</label>
                  <select
                    required
                    value={gradeStudentId}
                    onChange={(e) => setGradeStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {database.students.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Mata Ekskul</label>
                  <select
                    required
                    value={gradeEkskulId}
                    onChange={(e) => setGradeEkskulId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="">-- Pilih Ekskul --</option>
                    {database.extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>{e.nama}</option>
                    ))}
                  </select>
                </div>

                {/* SLiders criteria scoring */}
                <div className="space-y-3.5 pt-2 border-t border-border">
                  <div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Kehadiran (Presensi)</span>
                      <span className="text-maroon-500">{scoreAbsen} Poin</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={scoreAbsen}
                      onChange={(e) => setScoreAbsen(Number(e.target.value))}
                      className="w-full accent-emerald-600 mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Keaktifan & Antusias</span>
                      <span className="text-maroon-500">{scoreAktif} Poin</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={scoreAktif}
                      onChange={(e) => setScoreAktif(Number(e.target.value))}
                      className="w-full accent-emerald-600 mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Keterampilan & Teknik</span>
                      <span className="text-maroon-500">{scoreSkill} Poin</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={scoreSkill}
                      onChange={(e) => setScoreSkill(Number(e.target.value))}
                      className="w-full accent-emerald-600 mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Sikap & Akhlak (Karakter)</span>
                      <span className="text-maroon-500">{scoreSikap} Poin</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={scoreSikap}
                      onChange={(e) => setScoreSikap(Number(e.target.value))}
                      className="w-full accent-emerald-600 mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-sunken rounded-xl border border-border text-center">
                  <p className="text-[10px] text-gray-400">Prediksi Nilai Akhir:</p>
                  <p className="text-lg font-display font-bold text-maroon-600">
                    {Math.round((scoreAbsen + scoreAktif + scoreSkill + scoreSikap) / 4)} / 100
                  </p>
                  <span className="text-[10px] font-mono font-bold text-gold-600 uppercase">
                    Predikat: {calculateGrade((scoreAbsen + scoreAktif + scoreSkill + scoreSikap) / 4)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  Kunci & Simpan Nilai Raport
                </button>
              </form>
            )}
          </div>

          {/* Realtime scoring feed (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 bg-surface-sunken border-b border-border">
                <h3 className="font-display font-bold text-xs text-gray-800">
                  Daftar Nilai Masuk Terbaru
                </h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-128 overflow-y-auto">
                {database.assessments
                  .filter((ass) => ass && ass.namaSiswa)
                  .map((ass) => {
                    const eksName = database.extracurriculars.find((e) => e.id === ass.ekskulId)?.nama || "Ekskul";
                    const initial = ass.namaSiswa ? ass.namaSiswa[0] : "?";
                    const predPrefix = ass.predikat ? ass.predikat.split(" ")[0] : "";
                    return (
                      <div key={ass.id} className="p-4 hover:bg-surface-sunken/30 transition-colors flex justify-between items-center text-xs">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-maroon-500/10 text-maroon-500 flex items-center justify-center font-bold">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{ass.namaSiswa}</p>
                            <span className="text-[10px] text-gray-400">{ass.kelas} • {eksName}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-mono font-bold text-maroon-500">{ass.nilaiAkhir} / 100</p>
                          <span className="text-[10px] text-gray-400">{predPrefix}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-surface-sunken/30 text-center text-xs text-gray-400">
              Guru Wali Kelas dapat menarik rekap nilai ekskul ini otomatis ke dalam Raport Utama ARD Kemenag.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raport & Charts */}
      {activeTab === "raport" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel selectors (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-border shadow-xs">
            <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider mb-3">
              CARI RAPORT SANTRI ({database.students.length})
            </span>
            <div className="space-y-2">
              {database.students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedStudentId === s.id
                      ? "bg-gold-500/10 border-gold-500 text-maroon-700 font-bold"
                      : "bg-white border-border text-gray-600 hover:bg-surface-sunken"
                  }`}
                >
                  <div>
                    <p className="font-bold font-display">{s.nama}</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{s.kelas}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Right report view & progress (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Progress Trend graph */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                <div>
                  <h4 className="font-display font-bold text-sm text-gray-800 flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-maroon-500" />
                    Tren Grafik Perkembangan Kompetensi Santri
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Analisis kemajuan rata-rata nilai santri per semester</p>
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="semester" stroke="#94a3b8" fontSize={9} />
                    <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Raport Sheet Card */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h4 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wider">
                  Lembar Nilai Hasil Raport Santri
                </h4>
                <button
                  onClick={handlePrintRaport}
                  className="px-3 py-1.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                >
                  <Printer size={13} />
                  <span>Cetak Lembar Raport</span>
                </button>
              </div>

              {/* Table details */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-sunken text-gray-400 font-mono text-[9px] uppercase font-semibold">
                      <th className="p-3">Ekstrakurikuler</th>
                      <th className="p-3 text-center">Presensi</th>
                      <th className="p-3 text-center">Keaktifan</th>
                      <th className="p-3 text-center">Keterampilan</th>
                      <th className="p-3 text-center">Sikap</th>
                      <th className="p-3 text-right">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {database.assessments
                      .filter((a) => a && a.siswaId === selectedStudentId)
                      .map((ass) => {
                        const eksName = database.extracurriculars.find((e) => e.id === ass.ekskulId)?.nama || "Ekskul";
                        return (
                          <tr key={ass.id}>
                            <td className="p-3 font-bold text-gray-800">{eksName}</td>
                            <td className="p-3 text-center">{ass.kehadiran}</td>
                            <td className="p-3 text-center">{ass.keaktifan}</td>
                            <td className="p-3 text-center">{ass.keterampilan}</td>
                            <td className="p-3 text-center">{ass.sikap}</td>
                            <td className="p-3 text-right font-bold text-maroon-500">{ass.nilaiAkhir} ({ass.predikat ? ass.predikat.split(" ")[0] : ""})</td>
                          </tr>
                        );
                      })}
                    {database.assessments.filter((a) => a && a.siswaId === selectedStudentId).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400">
                          Belum ada data nilai raport terekam untuk santri ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Evaluasi Kinerja */}
      {activeTab === "evaluasi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Star Feedback Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Star size={16} className="text-gold-500 fill-amber-500" />
              Beri Evaluasi Pelatih & Pembina
            </h3>
            
            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Pilih Pelatih / Pembina Guru</label>
                <select
                  required
                  value={evalCoachId}
                  onChange={(e) => setEvalCoachId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                >
                  <option value="">-- Pilih Coach --</option>
                  {database.coaches.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama} ({c.keahlian})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Skor Penilaian Kinerja (Bintang 1 s/d 5)</label>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((sVal) => (
                    <button
                      key={sVal}
                      type="button"
                      onClick={() => setEvalScore(sVal)}
                      className="p-1.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={28}
                        className={sVal <= evalScore ? "text-gold-500 fill-amber-500" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Saran, Kritik & Masukan Kinerja Pelatih</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g., Mohon agar latihan panahan bisa disesuaikan dengan waktu shalat ashar agar ashar berjamaah di masjid tidak terlambat."
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                Kirim Evaluasi Anonim
              </button>
            </form>
          </div>

          {/* Evaluations Feed logs (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 bg-surface-sunken border-b border-border">
                <h3 className="font-display font-bold text-xs text-gray-800">
                  Umpan Balik Kinerja Masuk
                </h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-128 overflow-y-auto">
                {database.evaluations.map((ev) => (
                  <div key={ev.id} className="p-4 hover:bg-surface-sunken/30 transition-colors text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-gray-800">Pelatih: {ev.targetNama}</strong>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={12}
                            className={idx < ev.skorKinerja ? "text-gold-500 fill-amber-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-normal italic bg-surface-sunken p-2.5 rounded-xl border border-border">
                      "{ev.saranKritik}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Dikirim oleh: {ev.pemberiEvaluasi} ({ev.peranPemberi})</span>
                      <span>Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-surface-sunken/30 text-center text-xs text-gray-400">
              Evaluasi ini bersifat rahasia dan anonim untuk meningkatkan mutu pembinaan karakter olahraga di As-Syifa.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
