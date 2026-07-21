import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Camera,
  AlertCircle,
  Printer,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AppDatabase, Competition, Role } from "../types";

interface CompetitionsViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function CompetitionsView({ database, setDatabase, currentRole, currentStudentName }: CompetitionsViewProps) {
  const [filterStatus, setFilterStatus] = useState<"ALL" | "Pengajuan" | "Disetujui" | "Berjalan" | "Selesai">("ALL");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<"card" | "calendar">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Fixed starting August 2026 (since Bogor Open is Aug 15)

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formEkskulId, setFormEkskulId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formBudget, setFormBudget] = useState(0);
  const [formStatus, setFormStatus] = useState<any>("Pengajuan");
  const [formRank, setFormRank] = useState("");
  const [formPoints, setFormPoints] = useState(0);

  // Simulation states
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const resetForm = () => {
    setEditId(null);
    setFormName("");
    setFormEkskulId("");
    setFormDate("2026-08-15");
    setFormVenue("");
    setFormBudget(1500000);
    setFormStatus("Pengajuan");
    setFormRank("");
    setFormPoints(0);
  };

  const handleEdit = (comp: Competition) => {
    setEditId(comp.id);
    setFormName(comp.nama);
    setFormEkskulId(comp.ekskulId);
    setFormDate(comp.tanggal);
    setFormVenue(comp.tempat);
    setFormBudget(comp.anggaran);
    setFormStatus(comp.status);
    setFormRank(comp.prestasi?.peringkat || "");
    setFormPoints(comp.prestasi?.poinPrestasi || 0);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data perlombaan ini?")) {
      const updated = database.competitions.filter((c) => c.id !== id);
      const updatedDb = { ...database, competitions: updated };
      
      updatedDb.auditLogs.unshift({
        id: `log-${Date.now()}`,
        tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
        user: (currentStudentName || "Pengguna") ,
        peran: currentRole,
        aktivitas: "Hapus Perlombaan",
        detail: `Menghapus kompetisi ID: ${id}`
      });

      setDatabase(updatedDb);
      triggerAlert("✓ Perlombaan berhasil dihapus.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDb = { ...database };
    let actionLog = "";

    const parsedPrestasi = formRank ? { peringkat: formRank, trophy: "Piala", poinPrestasi: formPoints } : undefined;

    if (editId) {
      updatedDb.competitions = updatedDb.competitions.map((item) =>
        item.id === editId
          ? {
              ...item,
              nama: formName,
              ekskulId: formEkskulId,
              tanggal: formDate,
              tempat: formVenue,
              anggaran: formBudget,
              status: formStatus,
              prestasi: parsedPrestasi
            }
          : item
      );
      actionLog = `Mengupdate perlombaan: ${formName}`;
    } else {
      const newComp: Competition = {
        id: `comp-${Date.now()}`,
        nama: formName,
        ekskulId: formEkskulId,
        tanggal: formDate,
        tempat: formVenue,
        peserta: ["Sahkan", "Dira"],
        pendamping: (currentStudentName || "Pengguna") ,
        anggaran: formBudget,
        status: formStatus,
        prestasi: parsedPrestasi
      };
      updatedDb.competitions.push(newComp);
      actionLog = `Mengajukan perlombaan baru: ${formName}`;
    }

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: editId ? "Edit Kompetisi" : "Tambah Kompetisi",
      detail: actionLog
    });

    setDatabase(updatedDb);
    setShowFormModal(false);
    resetForm();
    triggerAlert("✓ Data perlombaan sukses disinkronkan ke server!");
  };

  const simulatePrintSuratTugas = (comp: Competition) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Surat Tugas - ${comp.nama}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 50px; color: #111827; line-height: 1.8; }
              .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 30px; }
              .logo-placeholder { text-align: center; margin-bottom: 10px; }
              .logo-placeholder img { width: 80px; height: 80px; object-fit: contain; }
              .title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
              .content { margin-bottom: 30px; font-size: 14px; }
              .sign { float: right; margin-top: 50px; text-align: center; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-placeholder">
                <img src="/logo.png" alt="Logo As-Syifa" />
              </div>
              <div style="font-size: 14px; font-weight: bold;">SMAIT AS-SYIFA BOARDING SCHOOL WANAREJA</div>
              <div style="font-size: 11px; color: #4b5563;">Jl. Raya Wanareja, Subang, Jawa Barat | Telp: (0260) 412211</div>
            </div>
            <div class="title">SURAT TUGAS DELEGASI</div>
            <div style="text-align: center; font-size: 12px; margin-top: -15px; margin-bottom: 30px;">Nomor: 421.3/ST-024/AEMS-SMAIT/VII/2026</div>

            <div class="content">
              <p>Yang bertanda tangan di bawah ini Kepala Sekolah SMAIT As-Syifa Boarding School Wanareja, memberikan tugas kepada delegasi ekstrakurikuler berikut:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;" border="1">
                <tr style="background: #f3f4f6;">
                  <th style="padding: 8px;">Agenda Kompetisi</th>
                  <th style="padding: 8px;">Tanggal Pelaksanaan</th>
                  <th style="padding: 8px;">Lokasi / Tempat</th>
                  <th style="padding: 8px;">Anggota Delegasi</th>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">${comp.nama}</td>
                  <td style="padding: 8px;">${comp.tanggal}</td>
                  <td style="padding: 8px;">${comp.tempat}</td>
                  <td style="padding: 8px;">Sahkan, Dira</td>
                </tr>
              </table>
              <p>Untuk melaksanakan tugas dengan penuh tanggung jawab, menjaga nama baik almamater pesantren, serta mematuhi seluruh SOP perlombaan yang berlaku.</p>
            </div>

            <div class="sign">
              Subang, ${new Date().toLocaleDateString("id-ID")}<br>
              Kepala Sekolah SMAIT As-Syifa,<br><br><br><br>
              <strong>(Kepala Sekolah)</strong>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      triggerAlert("Gagal membuka window cetak. Perbolehkan pop-up.");
    }
  };

  const simulateDocumentationUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      triggerAlert("✓ Dokumentasi & LPJ Perlombaan berhasil diunggah ke Cloud Storage AEMS!");
    }, 2000);
  };

  const getFilteredCompetitions = () => {
    if (filterStatus === "ALL") return database.competitions;
    return database.competitions.filter((c) => c.status === filterStatus);
  };

  const filteredCompetitions = getFilteredCompetitions();

  // Calendar Grid math helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const calendarCells: { day: number | null; dateStr: string }[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ day: null, dateStr: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ day: d, dateStr: dStr });
  }

  return (
    <div className="space-y-6">
      {/* Simulation notifier toast */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-medium animate-bounce border border-slate-700">
          <AlertCircle size={15} className="text-gold-400 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
            Manajemen Perlombaan & Prestasi
          </h2>
          <p className="text-xs text-gray-400 font-medium">Pengajuan delegasi perlombaan, cetak surat tugas dinas, dan arsip kejuaraan santri</p>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 self-start sm:self-center">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? "bg-white text-maroon-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Calendar size={13} />
              <span>Tampilan Kalender</span>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "card"
                  ? "bg-white text-maroon-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Trophy size={13} />
              <span>Daftar Kartu</span>
            </button>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => {
                resetForm();
                setShowFormModal(true);
              }}
              className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              Ajukan Perlombaan
            </button>
          )}
        </div>
      </div>

      {/* Calendar Navigation Panel (only in Calendar View) */}
      {viewMode === "calendar" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const prev = new Date(year, month - 1, 1);
                setCurrentDate(prev);
              }}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-sunken text-gray-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-display font-bold text-sm text-gray-800 font-mono min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={() => {
                const next = new Date(year, month + 1, 1);
                setCurrentDate(next);
              }}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-sunken text-gray-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gold-500"></span>
            <span>Arahkan kursor atau klik tanggal kosong untuk menambahkan perlombaan baru.</span>
          </div>
        </div>
      )}

      {/* Status Filter Tab */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterStatus === "ALL"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Semua Perlombaan ({database.competitions.length})
        </button>
        <button
          onClick={() => setFilterStatus("Pengajuan")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterStatus === "Pengajuan"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Pengajuan
        </button>
        <button
          onClick={() => setFilterStatus("Disetujui")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterStatus === "Disetujui"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          ✓ Disetujui
        </button>
        <button
          onClick={() => setFilterStatus("Selesai")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterStatus === "Selesai"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Kejuaraan Selesai
        </button>
      </div>

      {/* Conditional rendering based on selected view mode */}
      {viewMode === "calendar" ? (
        /* Monthly Calendar View specifically for Competitions */
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Days Name header */}
          <div className="grid grid-cols-7 border-b border-border text-center py-2.5 bg-surface-sunken text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            <div>Minggu</div>
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
          </div>

          {/* Calendar Day Grid cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
            {calendarCells.map((cell, idx) => {
              const dayComps = cell.day
                ? filteredCompetitions.filter((c) => c.tanggal === cell.dateStr)
                : [];

              return (
                <div
                  key={idx}
                  className={`min-h-28 p-2 text-left relative flex flex-col justify-between group/cell ${
                    cell.day ? "bg-white" : "bg-surface-sunken/40"
                  }`}
                >
                  {cell.day && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">{cell.day}</span>
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            resetForm();
                            setFormDate(cell.dateStr || "2026-08-15");
                            setShowFormModal(true);
                          }}
                          className="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded bg-maroon-50 text-maroon-500 hover:bg-maroon-100 transition-all"
                          title="Tambah perlombaan di hari ini"
                        >
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Day Competitions stack */}
                  <div className="mt-1 flex-1 space-y-1">
                    {dayComps.map((comp) => {
                      const eksName = database.extracurriculars.find((e) => e.id === comp.ekskulId)?.nama || "Ekskul Umum";
                      return (
                        <div
                          key={comp.id}
                          onClick={() => handleEdit(comp)}
                          className={`text-[10px] p-1.5 rounded border-l-2 leading-tight truncate text-left cursor-pointer transition-all hover:scale-[1.02] font-semibold ${
                            comp.status === "Selesai"
                              ? "bg-maroon-50/60 text-maroon-700 border-l-green-500"
                              : comp.status === "Disetujui"
                              ? "bg-maroon-100/60 text-blue-800 border-l-blue-500"
                              : "bg-gold-100/60 text-amber-800 border-l-amber-500"
                          }`}
                          title={`Lomba: ${comp.nama || comp.namaLomba} (${eksName}) - status: ${comp.status}`}
                        >
                          {comp.nama || comp.namaLomba}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Original Card Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((comp) => {
            const eksName = database.extracurriculars.find((e) => e.id === comp.ekskulId)?.nama || "Ekskul Umum";
            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-border hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded uppercase tracking-wider">
                      {eksName}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        comp.status === "Selesai"
                          ? "bg-maroon-50 text-maroon-700"
                          : comp.status === "Disetujui"
                          ? "bg-maroon-100 text-blue-800"
                          : "bg-gold-100 text-gold-700"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-800 leading-snug">
                      {comp.nama || comp.namaLomba}
                    </h3>
                    <div className="mt-3.5 space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{comp.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={13} className="text-maroon-400" />
                        <span>Anggaran: Rp {(comp.anggaran || comp.biaya || 0).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements Trophy Badge */}
                  {comp.prestasi && (
                    <div className="bg-gold-500/10 border border-gold-500/20 p-3 rounded-2xl flex items-center gap-3">
                      <div className="text-maroon-500"><Trophy size={24} /></div>
                      <div>
                        <p className="text-xs font-bold text-gold-600">{comp.prestasi.peringkat}</p>
                        <span className="text-[9px] text-gray-400 font-mono">Poin Prestasi: +{comp.prestasi.poinPrestasi} Poin</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons Panel */}
                <div className="px-5 py-3.5 bg-surface-sunken border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => simulatePrintSuratTugas(comp)}
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-600 hover:text-maroon-500 transition-colors"
                    title="Cetak Surat Tugas Resmi"
                  >
                    <Printer size={12} />
                    <span>Cetak Surtug</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {comp.status === "Selesai" && (
                      <button
                        onClick={simulateDocumentationUpload}
                        disabled={isUploading}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gold-500 transition-colors"
                        title="Upload LPJ & Dokumentasi"
                      >
                        <Camera size={12} className={isUploading ? "animate-pulse" : ""} />
                      </button>
                    )}

                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => handleEdit(comp)}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-maroon-500 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-navy-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Submission Modal Overlay */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wide">
                {editId ? "Edit" : "Ajukan"} Delegasi Perlombaan
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Perlombaan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., O2SN Archery Subang"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ekstrakurikuler</label>
                  <select
                    value={formEkskulId}
                    onChange={(e) => setFormEkskulId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  >
                    <option value="">Pilih Ekskul</option>
                    {database.extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>{e.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status Kejuaraan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  >
                    <option value="Pengajuan">Pengajuan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tempat</label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Anggaran Kegiatan (IDR)</label>
                <input
                  type="number"
                  required
                  value={formBudget}
                  onChange={(e) => setFormBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                />
              </div>

              {/* Achievement input toggles if Selesai */}
              {formStatus === "Selesai" && (
                <div className="bg-gold-500/5 p-3 rounded-2xl border border-gold-500/10 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-gold-600 block uppercase tracking-wider">
                    REKORDING PRESTASI KEJUARAAN
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Peringkat / Juara</label>
                      <input
                        type="text"
                        placeholder="e.g., Juara 1 Emas"
                        value={formRank}
                        onChange={(e) => setFormRank(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Poin Prestasi</label>
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        value={formPoints}
                        onChange={(e) => setFormPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-xs text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan Delegasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
