import React, { useState } from "react";
import { Users, Clock, Download, AlertCircle, Check, UserCheck, UserX, FileSpreadsheet, Search, Calendar, Bookmark, CheckSquare, RefreshCw, Trash2, TrendingUp, Sparkles, Award, ChevronRight, Filter, CheckCircle2, Thermometer, FileText, XCircle, BarChart2 } from "lucide-react";
import { AppDatabase, PresensiRecord, Role } from "../types";

interface PresensiViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function PresensiView({ database, setDatabase, currentRole, currentStudentName }: PresensiViewProps) {
  // Current date defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().substring(0, 10);
  });

  // Selected extracurricular (defaults to first one)
  const [selectedEkskulId, setSelectedEkskulId] = useState<string>(() => {
    return database.extracurriculars[0]?.id || "";
  });

  // Search filter for roster
  const [searchQuery, setSearchQuery] = useState("");

  // Search filter for history log
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Filter for history status
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("Semua");

  // Notification alerts
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);
  const canDelete = !["Pelatih", "Pembina Ekstrakurikuler", "Orang Tua", "Siswa", "Wali Kelas", "Kepala Sekolah"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Export to Excel / PDF simulations
  const handleExport = (format: "excel" | "pdf") => {
    const currentEkskul = database.extracurriculars.find(e => e.id === selectedEkskulId);
    const eksName = currentEkskul ? currentEkskul.nama.split(" ")[0] : "Ekskul";
    
    triggerAlert(`Mengompilasi laporan presensi manual ekskul ${eksName} tanggal ${selectedDate}...`);
    setTimeout(() => {
      if (format === "excel") {
        triggerAlert(`✓ Unduh Berhasil! Dokumen 'Rekap_Presensi_${eksName}_${selectedDate}.xlsx' telah disimpan.`);
      } else {
        triggerAlert(`✓ Unduh Berhasil! Dokumen 'Laporan_Presensi_${eksName}_${selectedDate}.pdf' telah disimpan.`);
      }
    }, 1500);
  };

  // Toggle/Set Single Student Attendance status
  const handleToggleStatus = (
    siswaId: string,
    status: "Hadir" | "Izin" | "Sakit" | "Alpa" | "Terlambat"
  ) => {
    if (isReadOnly) {
      triggerAlert("Akses Ditolak: Akun Anda tidak memiliki otoritas mengubah presensi.");
      return;
    }

    const studentObj = database.students.find((s) => s.id === siswaId);
    const ekskulObj = database.extracurriculars.find((e) => e.id === selectedEkskulId);

    if (!studentObj || !ekskulObj) {
      triggerAlert("Siswa atau Ekstrakurikuler tidak valid.");
      return;
    }

    const updatedDb = { ...database };
    const existingIndex = updatedDb.attendance.findIndex(
      (rec) =>
        rec.siswaId === siswaId &&
        rec.ekskulId === selectedEkskulId &&
        rec.tanggal === selectedDate
    );

    const timeString = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (existingIndex > -1) {
      // Update existing record
      updatedDb.attendance[existingIndex] = {
        ...updatedDb.attendance[existingIndex],
        status,
        waktuMasuk: timeString,
        metode: "Manual"
      };
    } else {
      // Create new record
      const newRecord: PresensiRecord = {
        id: `pres-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ekskulId: selectedEkskulId,
        tanggal: selectedDate,
        siswaId,
        namaSiswa: studentObj.nama,
        kelas: studentObj.kelas,
        asrama: studentObj.asrama,
        waktuMasuk: timeString,
        waktuPulang: "17:30",
        status,
        metode: "Manual"
      };
      updatedDb.attendance.unshift(newRecord);
    }

    // Add Audit Log Entry
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") + " (Pembina)",
      peran: currentRole,
      aktivitas: "Manual Presensi",
      detail: `Memperbarui presensi ${studentObj.nama} di ekskul ${ekskulObj.nama} menjadi [${status}]`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ ${studentObj.nama} ditandai [${status}]`);
  };

  // Bulk set all roster students
  const handleBulkMark = (status: "Hadir" | "Izin" | "Sakit" | "Alpa" | "Terlambat") => {
    if (isReadOnly) {
      triggerAlert("Akses Ditolak: Otoritas akun tidak cukup.");
      return;
    }

    const ekskulObj = database.extracurriculars.find((e) => e.id === selectedEkskulId);
    if (!ekskulObj) return;

    // Get all students enrolled in this extracurricular
    const enrolledStudents = database.students.filter((s) => s.ekskulIds.includes(selectedEkskulId));
    if (enrolledStudents.length === 0) {
      triggerAlert("Tidak ada santri terdaftar di ekskul ini.");
      return;
    }

    const updatedDb = { ...database };
    const timeString = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    enrolledStudents.forEach((studentObj) => {
      const existingIndex = updatedDb.attendance.findIndex(
        (rec) =>
          rec.siswaId === studentObj.id &&
          rec.ekskulId === selectedEkskulId &&
          rec.tanggal === selectedDate
      );

      if (existingIndex > -1) {
        updatedDb.attendance[existingIndex] = {
          ...updatedDb.attendance[existingIndex],
          status,
          waktuMasuk: timeString,
          metode: "Manual"
        };
      } else {
        const newRecord: PresensiRecord = {
          id: `pres-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ekskulId: selectedEkskulId,
          tanggal: selectedDate,
          siswaId: studentObj.id,
          namaSiswa: studentObj.nama,
          kelas: studentObj.kelas,
          asrama: studentObj.asrama,
          waktuMasuk: timeString,
          waktuPulang: "17:30",
          status,
          metode: "Manual"
        };
        updatedDb.attendance.unshift(newRecord);
      }
    });

    // Add Audit Log
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") + " (Pembina)",
      peran: currentRole,
      aktivitas: "Presensi Masal",
      detail: `Menandai seluruh santri ekskul ${ekskulObj.nama} sebagai [${status}]`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Berhasil menandai semua santri (${enrolledStudents.length} orang) sebagai [${status}]`);
  };

  // Delete a specific attendance log
  const handleDeleteRecord = (id: string) => {
    if (["Pelatih", "Pembina Ekstrakurikuler"].includes(currentRole)) {
      alert("Maaf, hak akses Anda dibatasi. Anda tidak dapat menghapus data ini.");
      return;
    }
    if (isReadOnly) {
      triggerAlert("Akses Ditolak: Otoritas akun tidak cukup.");
      return;
    }

    const updatedDb = { ...database };
    const record = updatedDb.attendance.find(r => r.id === id);
    if (!record) return;

    updatedDb.attendance = updatedDb.attendance.filter((rec) => rec.id !== id);

    // Audit log
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") + " (Pembina)",
      peran: currentRole,
      aktivitas: "Hapus Presensi",
      detail: `Menghapus catatan presensi ${record.namaSiswa} untuk tanggal ${record.tanggal}`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Catatan presensi ${record.namaSiswa} berhasil dihapus.`);
  };

  // Filter roster students
  const activeEkskul = database.extracurriculars.find((e) => e.id === selectedEkskulId);
  const rosterStudents = database.students.filter((s) => s.ekskulIds.includes(selectedEkskulId))
    .filter((s) => s.nama.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate statistics for the selected extracurricular roster
  const totalRosterCount = rosterStudents.length;
  const todaysRecords = database.attendance.filter(r => r.ekskulId === selectedEkskulId && r.tanggal === selectedDate);
  
  const presentCount = todaysRecords.filter(r => r.status === "Hadir").length;
  const sickCount = todaysRecords.filter(r => r.status === "Sakit").length;
  const permissionCount = todaysRecords.filter(r => r.status === "Izin").length;
  const lateCount = todaysRecords.filter(r => r.status === "Terlambat").length;
  const absentCount = todaysRecords.filter(r => r.status === "Alpa").length;
  const unaccountedCount = Math.max(0, totalRosterCount - todaysRecords.length);

  const attendanceRate = totalRosterCount > 0 
    ? Math.round(((presentCount + permissionCount + sickCount + lateCount) / totalRosterCount) * 100)
    : 100;

  // Filtered History Log
  const filteredHistory = database.attendance
    .filter(rec => {
      const matchSearch = rec.namaSiswa.toLowerCase().includes(historySearchQuery.toLowerCase());
      const matchStatus = historyStatusFilter === "Semua" || rec.status === historyStatusFilter;
      return matchSearch && matchStatus;
    });

  return (
    <div className="space-y-6">
      {/* Toast Alert Popup */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 bg-maroon-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-semibold animate-bounce border border-gold-500/30">
          <AlertCircle size={15} className="text-gold-500 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FEFDF0] rounded-lg text-gold-500">
              <CheckSquare size={18} />
            </span>
            <h2 className="font-display font-bold text-xl text-slate-800">
              Manual Presensi oleh Pelatih & Pembina
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan daftar kehadiran santri secara langsung. Silakan pilih jenis ekstrakurikuler, tanggal sesi latihan, lalu klik status kehadiran santri pada tabel roster.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="px-3.5 py-2 border border-slate-200 bg-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-maroon-500" />
            <span>Unduh Excel</span>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-3.5 py-2 border border-slate-200 bg-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-navy-500" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="bg-gradient-to-r from-maroon-500 to-maroon-700 p-5 rounded-2xl text-white shadow-md border border-gold-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Dropdown Ekskul Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-amber-200 block">
            1. PILIH EKSTRAKURIKULER
          </label>
          <select
            value={selectedEkskulId}
            onChange={(e) => setSelectedEkskulId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white outline-none focus:border-gold-500 font-semibold transition-all cursor-pointer backdrop-blur-sm"
          >
            {database.extracurriculars.map((e) => (
              <option key={e.id} value={e.id} className="text-slate-800 font-medium">
                {e.logo} {e.nama} ({e.hari})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-amber-200 block">
            2. TANGGAL SESI LATIHAN
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-gold-500 text-xs font-semibold cursor-pointer backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Coach / supervisor metadata */}
        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500/20 flex items-center justify-center border border-gold-500/30 shrink-0">
            <Award size={18} className="text-gold-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold tracking-wider text-[#FEF9C3]">Pelatih Logged-In</p>
            <p className="text-xs font-bold truncate">{currentStudentName || "Pengguna"}</p>
            <p className="text-[9px] opacity-75 truncate">Akses: {currentRole}</p>
          </div>
        </div>
      </div>

      {/* Attendance Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Siswa Hadir</p>
            <p className="text-xl font-bold text-maroon-500 mt-0.5">{presentCount}</p>
          </div>
          <CheckCircle2 className="text-maroon-500" size={20} />
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Sakit</p>
            <p className="text-xl font-bold text-gold-500 mt-0.5">{sickCount}</p>
          </div>
          <Thermometer className="text-gold-500" size={20} />
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Izin</p>
            <p className="text-xl font-bold text-maroon-500 mt-0.5">{permissionCount}</p>
          </div>
          <FileText className="text-navy-500" size={20} />
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Terlambat</p>
            <p className="text-xl font-bold text-gold-500 mt-0.5">{lateCount}</p>
          </div>
          <Clock className="text-gold-500" size={20} />
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Alpa</p>
            <p className="text-xl font-bold text-navy-500 mt-0.5">{absentCount}</p>
          </div>
          <XCircle className="text-maroon-500" size={20} />
        </div>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xs col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Presentase Hadir</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{attendanceRate}%</p>
          </div>
          <BarChart2 className="text-navy-500" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ROSTER TABLE (7 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Table Header Section */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-xs text-slate-800">
                  Daftar Santri Terdaftar ({activeEkskul?.nama || "Ekskul"})
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Klik tombol status di kanan santri untuk memperbarui absensi secara realtime.
                </p>
              </div>

              {/* Search box within roster */}
              <div className="relative w-full sm:w-48 shrink-0">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-[11px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Bulk Quick-Attendance Controls */}
            {!isReadOnly && (
              <div className="px-4 py-3 bg-[#FEFDF0] border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[10px] text-gold-500 uppercase tracking-wider">
                  ABSENSI MASAL PEKAN INI:
                </span>
                <button
                  onClick={() => handleBulkMark("Hadir")}
                  className="px-2.5 py-1 bg-maroon-50 hover:bg-maroon-100 text-maroon-700 text-[10px] font-bold rounded-lg border border-maroon-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} />
                  Hadirkan Semua
                </button>
                <button
                  onClick={() => handleBulkMark("Izin")}
                  className="px-2.5 py-1 bg-maroon-50 hover:bg-maroon-100 text-blue-800 text-[10px] font-bold rounded-lg border border-maroon-200 transition-colors cursor-pointer"
                >
                  Izinkan Semua
                </button>
                <button
                  onClick={() => handleBulkMark("Sakit")}
                  className="px-2.5 py-1 bg-gold-50 hover:bg-gold-100 text-amber-800 text-[10px] font-bold rounded-lg border border-gold-200 transition-colors cursor-pointer"
                >
                  Sakitkan Semua
                </button>
                <button
                  onClick={() => handleBulkMark("Alpa")}
                  className="px-2.5 py-1 bg-navy-50 hover:bg-navy-100 text-navy-700 text-[10px] font-bold rounded-lg border border-navy-200 transition-colors cursor-pointer"
                >
                  Alpakan Semua
                </button>
              </div>
            )}

            {/* Roster list block */}
            {rosterStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-semibold">Tidak Ada Santri Ditemukan</p>
                <p className="text-xs mt-1">Silakan cari nama lain atau cek konfigurasi pendaftaran santri di Master Data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/10 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      <th className="p-3 pl-4">Santri</th>
                      <th className="p-3">Status Saat Ini</th>
                      {!isReadOnly && <th className="p-3 text-right pr-4">Ganti Keterangan Presensi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {rosterStudents.map((siswa) => {
                      // Lookup existing record for this student on this day
                      const currentRec = database.attendance.find(
                        (r) => r.siswaId === siswa.id && r.ekskulId === selectedEkskulId && r.tanggal === selectedDate
                      );

                      // Determine letter avatar color
                      const charCodeSum = siswa.nama.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const bgColors = ["bg-maroon-100 text-maroon-600", "bg-maroon-100 text-maroon-600", "bg-gold-100 text-gold-600", "bg-navy-100 text-navy-600", "bg-maroon-100 text-maroon-600"];
                      const avatarStyle = bgColors[charCodeSum % bgColors.length];

                      return (
                        <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-3 pl-4 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${avatarStyle}`}>
                              {siswa.nama.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{siswa.nama}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{siswa.kelas}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {currentRec ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  currentRec.status === "Hadir"
                                    ? "bg-maroon-50 text-maroon-700 border border-maroon-200"
                                    : currentRec.status === "Izin"
                                    ? "bg-maroon-100 text-blue-800 border border-maroon-200"
                                    : currentRec.status === "Sakit"
                                    ? "bg-gold-100 text-amber-800 border border-gold-200"
                                    : currentRec.status === "Terlambat"
                                    ? "bg-orange-100 text-orange-800 border border-gold-200"
                                    : "bg-navy-100 text-navy-700 border border-navy-200"
                                }`}
                              >
                                <span>●</span> {currentRec.status}
                                <span className="text-[8px] opacity-60 font-normal">({currentRec.waktuMasuk})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200/50">
                                <span>○</span> Belum Diabsen
                              </span>
                            )}
                          </td>
                          {!isReadOnly && (
                            <td className="p-3 text-right pr-4">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleStatus(siswa.id, "Hadir")}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    currentRec?.status === "Hadir"
                                      ? "bg-maroon-500 text-white border-maroon-500 shadow-sm"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-maroon-50 hover:text-maroon-500"
                                  }`}
                                  title="Tandai Hadir"
                                >
                                  Hadir
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(siswa.id, "Izin")}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    currentRec?.status === "Izin"
                                      ? "bg-maroon-500 text-white border-blue-600 shadow-sm"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-maroon-50 hover:text-maroon-500"
                                  }`}
                                  title="Tandai Izin"
                                >
                                  Izin
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(siswa.id, "Sakit")}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    currentRec?.status === "Sakit"
                                      ? "bg-gold-500 text-white border-gold-500 shadow-sm"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-gold-50 hover:text-gold-600"
                                  }`}
                                  title="Tandai Sakit"
                                >
                                  Sakit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(siswa.id, "Alpa")}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    currentRec?.status === "Alpa"
                                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-navy-50 hover:text-navy-500"
                                  }`}
                                  title="Tandai Alpa"
                                >
                                  Alpa
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(siswa.id, "Terlambat")}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    currentRec?.status === "Terlambat"
                                      ? "bg-gold-500 text-white border-orange-500 shadow-sm"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-gold-50 hover:text-gold-500"
                                  }`}
                                  title="Tandai Terlambat"
                                >
                                  Terlambat
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] text-slate-400 font-mono">
            * Seluruh riwayat presensi disimpan ke dalam basis data digital dan di-sinkronisasikan ke asrama kesiswaan.
          </div>
        </div>

        {/* FEED LOGS (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-display font-bold text-xs text-slate-800">
                Log Histori Presensi Seluruh Kelas
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total: {database.attendance.length} riwayat kehadiran</p>
            </div>

            {/* Quick Filter Log controls */}
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari histori..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-[10px] rounded-lg border border-slate-200 bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {["Semua", "Hadir", "Izin", "Sakit", "Alpa"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryStatusFilter(f)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                      historyStatusFilter === f
                        ? "bg-maroon-500 text-white border-maroon-500"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* History Feed List */}
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xs">Tidak ada riwayat presensi yang sesuai.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-120 overflow-y-auto">
                {filteredHistory.slice(0, 15).map((rec) => {
                  const eksObject = database.extracurriculars.find((e) => e.id === rec.ekskulId);
                  const eksName = eksObject?.nama.split(" ")[0] || "Ekskul";

                  return (
                    <div key={rec.id} className="p-3 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-2.5 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-700 truncate">{rec.namaSiswa}</p>
                          <span className="text-[9px] bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-400 uppercase shrink-0">
                            {rec.metode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Ekskul: <strong className="text-slate-600 font-semibold">{eksName}</strong> • {rec.tanggal}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                          <Clock size={10} />
                          <span>Pukul {rec.waktuMasuk} WIB</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            rec.status === "Hadir"
                              ? "bg-maroon-50 text-maroon-700"
                              : rec.status === "Izin"
                              ? "bg-maroon-100 text-blue-800"
                              : rec.status === "Sakit"
                              ? "bg-gold-100 text-amber-800"
                              : rec.status === "Terlambat"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-navy-100 text-navy-700"
                          }`}
                        >
                          {rec.status}
                        </span>

                        {!isReadOnly && (
                          <>{canDelete && ( <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1 rounded text-slate-300 hover:text-navy-500 hover:bg-navy-50 transition-colors cursor-pointer"
                            title="Hapus Catatan Presensi"
                          >
                            <Trash2 size={11} />
                          </button> )}</>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] text-slate-400">
            Menampilkan maksimal 15 rekap log terbaru.
          </div>
        </div>

      </div>
    </div>
  );
}
