import React, { useState } from "react";
import { FileText, Printer, Plus, Edit2, Trash2, X, Check, Calendar, MapPin, Clock, Users, AlertCircle, User } from "lucide-react";
import { AppDatabase, Meeting, Role } from "../types";

interface MeetingsViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function MeetingsView({ database, setDatabase, currentRole, currentStudentName }: MeetingsViewProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(database.meetings[0]?.id || "");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [formAgenda, setFormAgenda] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formNotulen, setFormNotulen] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);
  const canDelete = !["Pelatih", "Pembina Ekstrakurikuler", "Orang Tua", "Siswa", "Wali Kelas", "Kepala Sekolah"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const selectedMeeting = database.meetings.find((m) => m.id === selectedMeetingId);

  const resetForm = () => {
    setEditId(null);
    setFormAgenda("");
    setFormDate("");
    setFormTime("09:00 - 11:00");
    setFormVenue("");
    setFormNotulen("");
  };

  const handleEdit = (m: Meeting) => {
    setEditId(m.id);
    setFormAgenda(m.agenda);
    setFormDate(m.tanggal);
    setFormTime(m.waktu);
    setFormVenue(m.tempat);
    setFormNotulen(m.notulensi);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    if (["Pelatih", "Pembina Ekstrakurikuler"].includes(currentRole)) {
      alert("Maaf, hak akses Anda dibatasi. Anda tidak dapat menghapus data ini.");
      return;
    }
    if (window.confirm("Hapus berita acara rapat ini?")) {
      const updated = database.meetings.filter((m) => m.id !== id);
      const updatedDb = { ...database, meetings: updated };

      updatedDb.auditLogs.unshift({
        id: `log-${Date.now()}`,
        tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
        user: (currentStudentName || "Pengguna") ,
        peran: currentRole,
        aktivitas: "Hapus Rapat",
        detail: `Menghapus berita acara rapat ID: ${id}`
      });

      setDatabase(updatedDb);
      triggerAlert("✓ Berita acara berhasil dihapus.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDb = { ...database };
    let actionLog = "";

    if (editId) {
      updatedDb.meetings = updatedDb.meetings.map((item) =>
        item.id === editId
          ? {
              ...item,
              agenda: formAgenda,
              tanggal: formDate,
              waktu: formTime,
              tempat: formVenue,
              notulensi: formNotulen
            }
          : item
      );
      actionLog = `Mengedit berita acara rapat agenda: ${formAgenda}`;
    } else {
      const newM: Meeting = {
        id: `meet-${Date.now()}`,
        agenda: formAgenda,
        tanggal: formDate,
        waktu: formTime,
        tempat: formVenue,
        pimpinanRapat: (currentStudentName || "Pengguna") ,
        pesertaHadir: ["Peserta 1", "Peserta 2", "Peserta 3"],
        notulensi: formNotulen
      };
      updatedDb.meetings.push(newM);
      actionLog = `Membuat berita acara rapat agenda baru: ${formAgenda}`;
    }

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: editId ? "Edit Rapat" : "Tambah Rapat",
      detail: actionLog
    });

    setDatabase(updatedDb);
    setShowFormModal(false);
    resetForm();
    triggerAlert("✓ Berita acara rapat berhasil dipublikasikan!");
  };

  const simulatePrintNotulen = (m: Meeting) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Notulensi Rapat - ${m.agenda}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 45px; color: #1e293b; line-height: 1.7; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 25px; }
              h1 { font-size: 18px; text-transform: uppercase; margin: 0; }
              h2 { font-size: 14px; font-weight: normal; margin: 5px 0 0 0; color: #475569; }
              .metadata { font-size: 12px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .section-title { font-weight: bold; font-size: 13px; text-transform: uppercase; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; }
              .content { font-size: 12px; white-space: pre-wrap; margin-top: 10px; }
              .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SMAIT AS-SYIFA BOARDING SCHOOL WANAREJA</h1>
              <h2>BERITA ACARA & NOTULENSI RAPAT KOORDINASI</h2>
            </div>

            <div class="metadata">
              <strong>Agenda Rapat:</strong> ${m.agenda}<br>
              <strong>Hari, Tanggal:</strong> ${m.tanggal}<br>
              <strong>Waktu:</strong> ${m.waktu} WIB<br>
              <strong>Tempat / Media:</strong> ${m.tempat}<br>
              <strong>Pimpinan Rapat:</strong> ${m.pimpinanRapat}<br>
              <strong>Peserta Hadir:</strong> ${m.pesertaHadir.join(", ")}
            </div>

            <div class="section-title">Hasil Keputusan & Notulensi Rapat</div>
            <div class="content">${m.notulensi}</div>

            <div class="footer">
              AEMS Digital Notulensi System • SMAIT As-Syifa Boarding School Wanareja • Dicetak otomatis pada ${new Date().toLocaleDateString("id-ID")}
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
      {/* Toast feedback alerts */}
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
            Pertemuan & Berita Acara Rapat
          </h2>
          <p className="text-xs text-gray-400">Arsip koordinasi pimpinan, berita acara keputusan, dan absensi kehadiran asrama</p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start"
          >
            <Plus size={15} />
            Buat Berita Acara Rapat
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left lists (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-border shadow-xs space-y-4">
          <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider">
            DAFTAR RAPAT TERARSIP ({database.meetings.length})
          </span>
          <div className="space-y-2 max-h-128 overflow-y-auto pr-1">
            {database.meetings.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMeetingId(m.id)}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex flex-col justify-between ${
                  selectedMeetingId === m.id
                    ? "bg-gold-500/10 border-gold-500 text-maroon-700"
                    : "bg-white border-border text-gray-600 hover:bg-surface-sunken"
                }`}
              >
                <div className="space-y-1">
                  <p className="font-bold font-display line-clamp-1">{m.agenda}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{m.tanggal} • {m.tempat}</span>
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-2 w-full text-[10px]">
                  <span className="text-gray-400">Pimpinan: {m.pimpinanRapat}</span>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(m);
                        }}
                        className="p-1 rounded bg-slate-100 text-gray-600"
                      >
                        <Edit2 size={9} />
                      </button>
                      <>{canDelete && ( <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                        className="p-1 rounded bg-slate-100 text-navy-500"
                      >
                        <Trash2 size={9} />
                      </button> )}</>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right MoM Viewer (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between min-h-128">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wider">
                    Hasil Keputusan & Notulen
                  </h3>
                  <button
                    onClick={() => simulatePrintNotulen(selectedMeeting)}
                    className="px-3 py-1.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                  >
                    <Printer size={13} />
                    <span>Cetak Notulensi</span>
                  </button>
                </div>

                <div className="space-y-3 bg-surface-sunken p-4 rounded-2xl border border-border text-xs">
                  <h4 className="font-display font-bold text-gray-800 text-sm">
                    {selectedMeeting.agenda}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-maroon-400" />
                      <span>{selectedMeeting.waktu} WIB</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-maroon-400" />
                      <span>{selectedMeeting.tempat}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Users size={12} className="text-maroon-400 shrink-0" />
                      <span className="truncate">Hadir: {selectedMeeting.pesertaHadir.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-wider">
                    NOTULENSI / BERITA ACARA RAPAT:
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line p-4 border border-gray-50 rounded-2xl bg-white">
                    {selectedMeeting.notulensi}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-sunken/30 border-t border-border text-center text-xs text-gray-400">
                Pimpinan rapat menyetujui lembar notulensi asrama di atas secara digital via sistem AEMS.
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-surface-sunken border border-border rounded-2xl text-gray-400">
              Tidak ada rapat terpilih. Buat agenda keputusan asrama baru untuk mendokumentasikan rapat kesiswaan.
            </div>
          )}
        </div>

      </div>

      {/* Form Dialog Modal Overlay */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wider">
                {editId ? "Edit" : "Buat"} Berita Acara Rapat
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Agenda Pembahasan Utama</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Evaluasi Kinerja Pembina Triwulan I"
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Waktu</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 09:00 - 11:30"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Tempat / Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ruang Rapat Lt. 2 Kesiswaan"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Berita Acara & Isi Keputusan Rapat (Notulensi)</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`1. Menetapkan kenaikan poin kejuaraan panahan sebesar 15%.\n2. Jadwal asrama dilarang bentrok dengan Ashar.`}
                  value={formNotulen}
                  onChange={(e) => setFormNotulen(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-sans"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Notulen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
