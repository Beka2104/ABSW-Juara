import React, { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Check,
  Smartphone,
  Mail,
  AlertCircle,
  FolderSync,
  X
} from "lucide-react";
import { AppDatabase, ScheduleEvent, Role } from "../types";

interface JadwalViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function JadwalView({ database, setDatabase, currentRole, currentStudentName }: JadwalViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Fixed starting July 2026
  const [calendarMode, setCalendarMode] = useState<"monthly" | "yearly">("monthly");
  
  // Create / Edit modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formEkskulId, setFormEkskulId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formType, setFormType] = useState<any>("Latihan Rutin");
  const [formDesc, setFormDesc] = useState("");

  // Simulator alerts
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Sync Google Calendar Simulation
  const handleSyncGoogleCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      triggerAlert("✓ Kalender AEMS berhasil disinkronkan dengan Google Calendar SMAIT As-Syifa!");
    }, 2000);
  };

  // Send Automatic WA Reminder simulation
  const handleSendWaReminder = (event: ScheduleEvent) => {
    triggerAlert(`Mengirim pesan WhatsApp pengingat otomatis untuk "${event.judul}" kepada Pelatih & Wali Asrama...`);
    setTimeout(() => {
      triggerAlert(`✓ WhatsApp Terkirim! "Assalamualaikum Ust., diingatkan esok hari jadwal ${event.judul} jam ${event.jamMulai} di ${event.tempat}."`);
    }, 2500);
  };

  const handleSendEmailReminder = (event: ScheduleEvent) => {
    triggerAlert(`Mengirim email reminder otomatis agenda "${event.judul}" ke seluruh peserta...`);
    setTimeout(() => {
      triggerAlert(`✓ Email Terkirim! Notifikasi reminder agenda "${event.judul}" masuk ke Inbox.`);
    }, 2000);
  };

  // Calendar calculations (Month Grid of 35 days)
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

  // Build grid items
  const calendarCells = [];
  // padding previous month days
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ day: null, dateStr: "" });
  }
  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ day: d, dateStr: dStr });
  }

  // Handle Event Saver
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDb = { ...database };
    const randomColors = ["#16a34a", "#fbbf24", "#dc2626", "#4f46e5", "#ec4899", "#14b8a6"];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

    if (selectedEvent) {
      // Editing
      updatedDb.schedules = updatedDb.schedules.map((item) =>
        item.id === selectedEvent.id
          ? {
              ...item,
              judul: formTitle,
              ekskulId: formEkskulId,
              tanggal: formDate,
              jamMulai: formStart,
              jamSelesai: formEnd,
              tempat: formVenue,
              tipe: formType,
              keterangan: formDesc
            }
          : item
      );
    } else {
      // Creating
      const newEv: ScheduleEvent = {
        id: `ev-${Date.now()}`,
        judul: formTitle,
        ekskulId: formEkskulId,
        tanggal: formDate,
        jamMulai: formStart,
        jamSelesai: formEnd,
        tempat: formVenue,
        tipe: formType,
        keterangan: formDesc,
        color: randomColor
      };
      updatedDb.schedules.push(newEv);
    }

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: selectedEvent ? "Edit Jadwal" : "Tambah Jadwal",
      detail: `Menyimpan jadwal baru: ${formTitle}`
    });

    setDatabase(updatedDb);
    setShowEventModal(false);
    setSelectedEvent(null);
    triggerAlert("✓ Jadwal kegiatan berhasil disinkronkan!");
  };

  const handleOpenCreate = (dateStr?: string) => {
    setSelectedEvent(null);
    setFormTitle("");
    setFormEkskulId("");
    setFormDate(dateStr || "2026-07-04");
    setFormStart("16:00");
    setFormEnd("17:30");
    setFormVenue("");
    setFormType("Latihan Rutin");
    setFormDesc("");
    setShowEventModal(true);
  };

  const handleOpenEdit = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setFormTitle(event.judul);
    setFormEkskulId(event.ekskulId);
    setFormDate(event.tanggal);
    setFormStart(event.jamMulai);
    setFormEnd(event.jamSelesai);
    setFormVenue(event.tempat);
    setFormType(event.tipe);
    setFormDesc(event.keterangan);
    setShowEventModal(true);
  };

  // Drag and Drop Simulator
  const handleDragDropMove = (event: ScheduleEvent, newDay: number) => {
    const newDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(newDay).padStart(2, "0")}`;
    const updatedSchedules = database.schedules.map((s) =>
      s.id === event.id ? { ...s, tanggal: newDateStr } : s
    );
    const updatedDb = { ...database, schedules: updatedSchedules };
    
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: "Drag and Drop Jadwal",
      detail: `Memindahkan agenda "${event.judul}" ke tanggal ${newDateStr}`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Berhasil memindahkan agenda "${event.judul}" ke tanggal ${newDateStr}!`);
  };

  return (
    <div className="space-y-6">
      {/* Alert toast notifier */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-medium animate-bounce border border-border">
          <AlertCircle size={15} className="text-gold-400 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
            Jadwal & Kalender Akademik Ekskul
          </h2>
          <p className="text-xs text-gray-400">Kalender operasional tahunan dan reminder WhatsApp otomatis santri</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className="px-3.5 py-2 border border-gray-200 bg-white hover:text-maroon-500 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FolderSync size={14} className={isSyncing ? "animate-spin text-maroon-400" : ""} />
            <span>{isSyncing ? "Menghubungkan..." : "Google Calendar Sync"}</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => handleOpenCreate()}
              className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              Tambah Agenda
            </button>
          )}
        </div>
      </div>

      {/* Views Toggle Control */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-border">
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
          <span className="font-display font-bold text-sm text-gray-800 font-mono">
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

        <div className="flex bg-surface-sunken p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setCalendarMode("monthly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              calendarMode === "monthly"
                ? "bg-white text-maroon-500 shadow-xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Monthly Grid
          </button>
          <button
            onClick={() => setCalendarMode("yearly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              calendarMode === "yearly"
                ? "bg-white text-maroon-500 shadow-xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Year Planner
          </button>
        </div>
      </div>

      {/* Monthly Calendar View */}
      {calendarMode === "monthly" ? (
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
              const dayEvents = cell.day
                ? database.schedules.filter((s) => s.tanggal === cell.dateStr)
                : [];
              const dayComps = cell.day
                ? database.competitions.filter((c) => c.tanggal === cell.dateStr)
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
                          onClick={() => handleOpenCreate(cell.dateStr)}
                          className="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded bg-maroon-50 text-maroon-500 hover:bg-maroon-100 transition-all"
                          title="Tambah kegiatan di hari ini"
                        >
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Day Events stack */}
                  <div className="mt-1 flex-1 space-y-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleOpenEdit(ev)}
                        className="text-[10px] p-1 rounded border leading-tight truncate text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: `${ev.color || "#16a34a"}15`,
                          borderColor: ev.color || "#16a34a",
                          color: ev.color || "#16a34a"
                        }}
                        title={`${ev.judul} (${ev.jamMulai} - ${ev.jamSelesai})`}
                      >
                        <span className="font-bold shrink-0">[{ev.jamMulai.split(":")[0]}]</span> {ev.judul}
                      </div>
                    ))}
                    {dayComps.map((comp) => (
                      <div
                        key={comp.id}
                        className="text-[10px] p-1 rounded border-l-2 border-gold-500 bg-gold-500/10 text-gold-600 font-bold leading-tight truncate text-left cursor-pointer transition-all hover:scale-[1.02]"
                        title={`Lomba: ${comp.nama || comp.namaLomba} (${comp.tempat || comp.lokasi})`}
                      >
                        {comp.nama || comp.namaLomba}
                      </div>
                    ))}
                  </div>

                  {/* Drag-and-Drop Move date simulation triggers */}
                  {cell.day && dayEvents.length === 0 && dayComps.length === 0 && (
                    <div className="text-[8px] text-gray-300 font-mono text-center select-none py-1 hidden group-hover/cell:block">
                      Drop area
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Year Planner View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthNames.map((mName, mIdx) => (
            <div
              key={mIdx}
              className="bg-white rounded-2xl border border-border p-4 shadow-xs"
            >
              <h4 className="font-display font-bold text-xs text-gray-800 border-b border-gray-50 pb-2 mb-2">
                {mName} 2026
              </h4>
              <div className="space-y-1.5">
                {[
                  ...database.schedules.map(s => ({ ...s, isComp: false, keyId: `sch-${s.id}` })),
                  ...database.competitions.map(c => ({
                    id: c.id,
                    judul: `Lomba: ${c.nama || c.namaLomba}`,
                    tanggal: c.tanggal || "2026-07-01",
                    color: "#f59e0b",
                    isComp: true,
                    keyId: `comp-${c.id}`
                  }))
                ]
                  .filter((s) => {
                    if (!s.tanggal) return false;
                    const sDate = new Date(s.tanggal);
                    return sDate.getMonth() === mIdx;
                  })
                  .map((ev) => (
                    <div
                      key={ev.keyId}
                      onClick={() => !ev.isComp && handleOpenEdit(ev as any)}
                      className={`text-[10px] p-1.5 rounded border-l-2 cursor-pointer truncate ${
                        ev.isComp ? "bg-gold-500/10 text-amber-800 border-l-amber-500 font-semibold" : "bg-surface-sunken"
                      }`}
                      style={{ borderLeftColor: ev.isComp ? "#f59e0b" : (ev.color || "#16a34a") }}
                    >
                      <span className="font-semibold text-gray-700">
                        {ev.tanggal ? ev.tanggal.split("-")[2] : "01"}:
                      </span>{" "}
                      {ev.judul}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Detail Agenda Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wide">
                {selectedEvent ? "Detail & Edit Agenda" : "Buat Agenda Jadwal Baru"}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
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
                    <option value="">Umum / Semua</option>
                    {database.extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>{e.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe Agenda</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  >
                    <option value="Latihan Rutin">Latihan Rutin</option>
                    <option value="Ujian Kenaikan Tingkat">Ujian Kenaikan Tingkat</option>
                    <option value="Rapat Koordinasi">Rapat Koordinasi</option>
                    <option value="Perlombaan">Perlombaan</option>
                    <option value="Pameran/Demo">Pameran/Demo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Mulai</label>
                  <input
                    type="text"
                    required
                    placeholder="16:00"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Selesai</label>
                  <input
                    type="text"
                    required
                    placeholder="17:30"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tempat / Lokasi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., GSG As-Syifa"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                />
              </div>

              {/* Reminder broadcast panel */}
              {selectedEvent && (
                <div className="bg-surface-sunken p-3.5 rounded-xl border border-border space-y-2">
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    SIARKAN PENGINGAT (REMINDER BROADCAST)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWaReminder(selectedEvent)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-maroon-500/10 text-maroon-500 border border-maroon-400/20 text-[10px] font-bold"
                    >
                      <Smartphone size={12} />
                      WhatsApp Pelatih
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmailReminder(selectedEvent)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-maroon-500/10 text-maroon-500 border border-blue-500/20 text-[10px] font-bold"
                    >
                      <Mail size={12} />
                      Email Peserta
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                {selectedEvent && !isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Hapus agenda ini?")) {
                        const updated = database.schedules.filter((s) => s.id !== selectedEvent.id);
                        setDatabase({ ...database, schedules: updated });
                        setShowEventModal(false);
                        triggerAlert("✓ Agenda berhasil dihapus.");
                      }
                    }}
                    className="mr-auto px-3 py-2 text-xs font-bold text-navy-500 hover:underline"
                  >
                    Hapus
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-200 text-xs text-gray-500 rounded-xl"
                >
                  Tutup
                </button>

                {!isReadOnly && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow"
                  >
                    {selectedEvent ? "Simpan Perubahan" : "Buat Agenda"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drag simulator panel */}
      {!isReadOnly && (
        <div className="bg-gold-500/5 p-4 rounded-2xl border border-gold-500/10 flex items-start gap-3">
          <Smartphone className="text-gold-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-xs font-bold text-gray-800">
              Uji Coba Fitur Drag and Drop (Move Simulator)
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
              Dalam sistem AEMS, administrator dapat dengan mudah menggeser agenda untuk mengubah tanggal. Simulasikan pemindahan agenda di bawah:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {database.schedules.slice(0, 3).map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => handleDragDropMove(ev, 15)} // Moves to the 15th
                  className="px-2.5 py-1 text-[10px] bg-white border border-gray-200 rounded-lg hover:border-gold-500 hover:text-gold-600 transition-all font-medium flex items-center gap-1 shadow-2xs"
                >
                  Geser "{ev.judul}" ke Tanggal 15
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
