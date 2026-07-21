import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  History,
  Plus,
  Edit2,
  BookOpen,
  Check,
  X,
  AlertCircle,
  Upload,
  Paperclip,
  Trash2
} from "lucide-react";
import { AppDatabase, Sop, Role } from "../types";

interface SopViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function SopView({ database, setDatabase, currentRole, currentStudentName }: SopViewProps) {
  const [selectedSopId, setSelectedSopId] = useState<string>(database.sops[0]?.id || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVersion, setEditVersion] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Create fields
  const [createTitle, setCreateTitle] = useState("");
  const [createCategory, setCreateCategory] = useState<any>("SOP Pelatih");
  const [createContent, setCreateContent] = useState("");

  // File Upload states
  const [formFileName, setFormFileName] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [editFileUrl, setEditFileUrl] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Simulator alerts
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const selectedSop = database.sops.find((s) => s.id === selectedSopId);
  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);

  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFile(true);
      setTimeout(() => {
        setFormFileName(file.name);
        setFormFileUrl(`/docs/sop/${file.name}`);
        setIsUploadingFile(false);
        triggerAlert(`✓ Berkas "${file.name}" siap dilampirkan.`);
      }, 1000);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFile(true);
      setTimeout(() => {
        setEditFileName(file.name);
        setEditFileUrl(`/docs/sop/${file.name}`);
        setIsUploadingFile(false);
        triggerAlert(`✓ Berkas revisi "${file.name}" siap dilampirkan.`);
      }, 1000);
    }
  };

  const handleDirectAttach = (e: React.ChangeEvent<HTMLInputElement>, sopId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFile(true);
      setTimeout(() => {
        const updatedSops = database.sops.map((sop) => {
          if (sop.id === sopId) {
            const history = [...sop.riwayatPerubahan];
            history.unshift({
              id: `rh-${Date.now()}`,
              tanggal: new Date().toISOString().substring(0, 10),
              versi: sop.versi,
              diubahOleh: (currentStudentName || "Pengguna") + " (Koordinator)",
              deskripsi: `Melampirkan berkas fisik SOP: ${file.name}`
            });
            return {
              ...sop,
              fileName: file.name,
              fileUrl: `/docs/sop/${file.name}`,
              riwayatPerubahan: history
            };
          }
          return sop;
        });

        const updatedDb = { ...database, sops: updatedSops };
        updatedDb.auditLogs.unshift({
          id: `log-${Date.now()}`,
          tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
          user: (currentStudentName || "Pengguna") ,
          peran: currentRole,
          aktivitas: "Lampirkan Berkas SOP",
          detail: `Melampirkan berkas "${file.name}" ke dokumen SOP: ${selectedSop?.judul}`
        });

        setDatabase(updatedDb);
        setIsUploadingFile(false);
        triggerAlert(`✓ Berkas "${file.name}" berhasil diunggah dan dilampirkan langsung!`);
      }, 1200);
    }
  };

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Basic Markdown Interpreter to JSX
  const parseMarkdownToJSX = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="font-display font-bold text-xl sm:text-2xl text-maroon-700 mt-4 mb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="font-display font-bold text-lg text-maroon-600 mt-3 mb-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="font-display font-bold text-sm text-gray-800 mt-2 mb-1">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-gray-600 leading-relaxed mb-1">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      // Replace **bold**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-emerald-950">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={idx} className="text-xs text-gray-600 leading-relaxed mb-2">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const handlePrint = () => {
    if (!selectedSop) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak SOP - ${selectedSop.judul}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { color: #065f46; font-size: 24px; border-bottom: 2px solid #065f46; padding-bottom: 10px; }
              h2 { color: #047857; font-size: 18px; margin-top: 20px; }
              h3 { font-size: 14px; margin-top: 15px; color: #0f172a; }
              p, li { font-size: 12px; }
              .meta { font-size: 10px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>${selectedSop.judul}</h1>
            <p><strong>Kategori:</strong> ${selectedSop.kategori} | <strong>Versi:</strong> ${selectedSop.versi}</p>
            <div>${selectedSop.konten.replace(/\n/g, "<br>")}</div>
            <div class="meta">
              SMAIT As-Syifa Boarding School Wanareja<br>
              AEMS Digital Document System - Dicetak pada ${new Date().toLocaleDateString("id-ID")}
            </div>
          </div>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      triggerAlert("Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan di peramban Anda.");
    }
  };

  const simulateDownloadPdf = () => {
    if (!selectedSop) return;
    triggerAlert(`Mengonversi "${selectedSop.judul}" ke dokumen PDF...`);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([selectedSop.konten], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedSop.judul.replace(/ /g, "_")}_${selectedSop.versi}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerAlert("✓ Berhasil mengunduh dokumen (PDF Terkompresi).");
    }, 1500);
  };

  const handleOpenEdit = () => {
    if (!selectedSop) return;
    setEditTitle(selectedSop.judul);
    setEditContent(selectedSop.konten);
    setEditVersion(selectedSop.versi);
    setEditNotes("");
    setEditFileName(selectedSop.fileName || "");
    setEditFileUrl(selectedSop.fileUrl || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSop) return;

    const updatedSops = database.sops.map((sop) => {
      if (sop.id === selectedSop.id) {
        const history = [...sop.riwayatPerubahan];
        history.unshift({
          id: `rh-${Date.now()}`,
          tanggal: new Date().toISOString().substring(0, 10),
          versi: editVersion,
          diubahOleh: (currentStudentName || "Pengguna") + " (Koordinator)",
          deskripsi: editNotes || "Melakukan revisi konten SOP."
        });
        return {
          ...sop,
          judul: editTitle,
          konten: editContent,
          versi: editVersion,
          fileName: editFileName || undefined,
          fileUrl: editFileUrl || undefined,
          riwayatPerubahan: history
        };
      }
      return sop;
    });

    const updatedDb = { ...database, sops: updatedSops };
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: "Revisi SOP",
      detail: `Membuat revisi baru untuk SOP: ${editTitle}`
    });

    setDatabase(updatedDb);
    setShowEditModal(false);
    triggerAlert("✓ Revisi SOP berhasil disimpan dan dipublikasikan.");
  };

  const handleDeleteSop = () => {
    if (!selectedSop) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus SOP ini? Tindakan ini permanen.")) {
      const updatedSops = database.sops.filter((s) => s.id !== selectedSop.id);
      const updatedDb = { ...database, sops: updatedSops };
      setDatabase(updatedDb);
      setSelectedSopId("");
      triggerAlert("✓ Dokumen SOP berhasil dihapus.");
    }
  };

  const handleCreateSop = (e: React.FormEvent) => {
    e.preventDefault();
    const newSop: Sop = {
      id: `sop-${Date.now()}`,
      judul: createTitle,
      kategori: createCategory,
      konten: createContent,
      versi: "v1.0",
      fileName: formFileName || undefined,
      fileUrl: formFileUrl || undefined,
      riwayatPerubahan: [
        {
          id: `rh-${Date.now()}`,
          tanggal: new Date().toISOString().substring(0, 10),
          versi: "v1.0",
          diubahOleh: (currentStudentName || "Pengguna") + " (Koordinator)",
          deskripsi: "Penerbitan dokumen SOP pertama kali."
        }
      ]
    };

    const updatedDb = { ...database, sops: [...database.sops, newSop] };
    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: "Tambah SOP",
      detail: `Menerbitkan dokumen SOP baru: ${createTitle}`
    });

    setDatabase(updatedDb);
    setSelectedSopId(newSop.id);
    setShowCreateModal(false);
    setCreateTitle("");
    setCreateContent("");
    setFormFileName("");
    setFormFileUrl("");
    triggerAlert("✓ SOP baru berhasil diterbitkan.");
  };

  return (
    <div className="space-y-6">
      {/* Simulation alert toast */}
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
            Standard Operating Procedure (SOP)
          </h2>
          <p className="text-xs text-gray-400">Pedoman operasional standar seluruh civitas olahraga & seni pesantren</p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start"
          >
            <Plus size={15} />
            Terbitkan SOP Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SOP Menu List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-surface-sunken rounded-xl border border-border">
            <h3 className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-bold mb-3">
              Daftar SOP Tersedia ({database.sops.length})
            </h3>
            <div className="space-y-2">
              {database.sops.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSopId(s.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    selectedSopId === s.id
                      ? "bg-gold-500/10 border-gold-500 text-maroon-700 font-bold"
                      : "bg-white border-border hover:bg-surface-sunken text-gray-600"
                  }`}
                >
                  <BookOpen size={16} className="shrink-0 text-gold-500" />
                  <div className="min-w-0">
                    <p className="truncate font-bold font-display">{s.judul}</p>
                    <span className="text-[9px] font-mono font-semibold text-gray-400 block mt-1 uppercase">
                      {s.kategori} • Versi {s.versi}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected SOP Viewer (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedSop ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              
              {/* SOP Top Bar Controls */}
              <div className="p-4 bg-surface-sunken border-b border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold bg-maroon-100 text-maroon-700 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedSop.kategori}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    Versi: {selectedSop.versi}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white hover:text-maroon-500 transition-all shadow-xs"
                    title="Cetak SOP"
                  >
                    <Printer size={13} />
                    <span>Cetak</span>
                  </button>

                  <button
                    onClick={simulateDownloadPdf}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white hover:text-maroon-500 transition-all shadow-xs"
                    title="Unduh PDF"
                  >
                    <Download size={13} />
                    <span>Unduh PDF</span>
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white hover:text-maroon-500 transition-all shadow-xs"
                    title="Riwayat Perubahan"
                  >
                    <History size={13} />
                    <span>Riwayat</span>
                  </button>

                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenEdit}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 rounded-lg transition-all shadow-sm"
                        title="Buat Revisi SOP"
                      >
                        <Edit2 size={13} />
                        <span>Revisi</span>
                      </button>
                      <button
                        onClick={handleDeleteSop}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all shadow-sm"
                        title="Hapus SOP"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachment / File Section */}
              <div className="mx-6 md:mx-8 mt-6 p-4 rounded-2xl bg-slate-50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-maroon-50 text-maroon-500 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800">
                      {selectedSop.fileName ? "Berkas SOP Terlampir" : "Belum Ada Berkas Lampiran"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate max-w-[200px] sm:max-w-[350px]">
                      {selectedSop.fileName ? selectedSop.fileName : "Unggah salinan dokumen resmi (PDF/Word)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedSop.fileUrl ? (
                    <button
                      onClick={() => {
                        triggerAlert(`Mengunduh berkas "${selectedSop.fileName}"...`);
                        setTimeout(() => {
                          const link = document.createElement("a");
                          link.href = "#";
                          link.setAttribute("download", selectedSop.fileName || "SOP.pdf");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          triggerAlert("✓ Berkas berhasil diunduh.");
                        }, 1000);
                      }}
                      className="px-3 py-1.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Unduh Berkas</span>
                    </button>
                  ) : !isReadOnly ? (
                    <div className="relative">
                      <button className="px-3 py-1.5 bg-gold-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
                        <Upload size={12} />
                        <span>Unggah Berkas</span>
                      </button>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => handleDirectAttach(e, selectedSop.id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-medium italic">Hanya pembina yang dapat mengunggah berkas</span>
                  )}
                </div>
              </div>

              {/* Document Container */}
              <div className="p-6 md:p-8 max-w-none">
                <div className="prose prose-emerald">
                  {parseMarkdownToJSX(selectedSop.konten)}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-surface-sunken border border-border rounded-2xl text-gray-400">
              Tidak ada SOP terpilih. Silakan terbitkan dokumen pertama Anda.
            </div>
          )}
        </div>

      </div>

      {/* History Log Modal */}
      {showHistoryModal && selectedSop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
                <History size={16} className="text-gold-500" />
                Riwayat Perubahan & Versi
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedSop.riwayatPerubahan.map((rh) => (
                <div key={rh.id} className="relative pl-6 border-l-2 border-emerald-500/30 last:border-l-0 pb-2">
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-maroon-500 border-2 border-white" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-maroon-700">Versi {rh.versi}</span>
                    <span className="text-[10px] font-mono text-gray-400">{rh.tanggal}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-normal">
                    {rh.deskripsi}
                  </p>
                  <span className="text-[9px] text-gray-400 block mt-1.5">Oleh: {rh.diubahOleh}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-surface-sunken border-t border-border text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Editor Modal */}
      {showEditModal && selectedSop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800">
                Buat Lembar Revisi SOP (Versioning)
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nomor Versi Baru</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., v2.2"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Catatan Revisi / Log Perubahan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Penambahan sub-keselamatan panahan"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Konten Dokumen (Mendukung Judul #, ## dan list -)</label>
                <textarea
                  rows={10}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Lampiran Berkas SOP Hasil Revisi (PDF, DOCX)</label>
                <div className="relative border border-dashed border-gray-200 hover:border-emerald-500 p-3 rounded-xl text-center bg-surface-sunken cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleEditFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isUploadingFile ? (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] text-gray-400">Mengunggah...</p>
                    </div>
                  ) : editFileName ? (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <Paperclip className="text-maroon-400 shrink-0" size={14} />
                      <span className="text-xs font-bold text-maroon-500 truncate max-w-[200px] sm:max-w-xs">{editFileName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditFileName("");
                          setEditFileUrl("");
                        }}
                        className="text-navy-500 hover:text-navy-600 font-bold ml-1 text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      <Upload className="text-gray-400 mx-auto mb-1" size={16} />
                      <p className="text-xs font-bold text-gray-600">Pilih Berkas Baru (Opsional)</p>
                      <p className="text-[9px] text-gray-400">Ganti berkas PDF/Word sebelumnya jika diperlukan</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-xs text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Publikasikan Revisi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create SOP Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800">
                Menerbitkan Dokumen SOP Baru
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateSop} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Judul SOP</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SOP Penggunaan Sarana Lapangan Panahan"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                  >
                    <option value="SOP Pelatih">SOP Pelatih</option>
                    <option value="SOP Pembina">SOP Pembina</option>
                    <option value="SOP Peserta">SOP Peserta</option>
                    <option value="SOP Perlombaan">SOP Perlombaan</option>
                    <option value="SOP Perizinan">SOP Perizinan</option>
                    <option value="SOP Presensi">SOP Presensi</option>
                    <option value="SOP Keselamatan">SOP Keselamatan</option>
                    <option value="SOP Penggunaan Sarana">SOP Penggunaan Sarana</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Isi Konten (Format judul #, ## dan baris -)</label>
                  <textarea
                    rows={8}
                    required
                    placeholder={`# SOP BARU\n## Aturan Utama\n- Aturan 1\n- Aturan 2`}
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lampiran Berkas SOP Fisik (PDF, DOCX)</label>
                  <div className="relative border border-dashed border-gray-200 hover:border-emerald-500 p-3.5 rounded-xl text-center bg-surface-sunken cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleCreateFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {isUploadingFile ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-400">Mengunggah...</p>
                      </div>
                    ) : formFileName ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <Paperclip className="text-maroon-400 shrink-0" size={14} />
                        <span className="text-xs font-bold text-maroon-500 truncate max-w-[200px] sm:max-w-xs">{formFileName}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormFileName("");
                            setFormFileUrl("");
                          }}
                          className="text-navy-500 hover:text-navy-600 font-bold ml-1 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="py-1">
                        <Upload className="text-gray-400 mx-auto mb-1" size={16} />
                        <p className="text-xs font-bold text-gray-600">Pilih Berkas Lampiran (Opsional)</p>
                        <p className="text-[9px] text-gray-400">Dukungan format PDF, DOCX, atau TXT</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-xs text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Terbitkan Dokumen SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
