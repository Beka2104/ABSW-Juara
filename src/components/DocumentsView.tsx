import React, { useState, useRef, useEffect } from "react";
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle, Plus, Edit2, Trash2, X, Check, Download, AlertCircle, PenTool, Search, FileSpreadsheet, User } from "lucide-react";
import { AppDatabase, DocumentRecord, Role } from "../types";

interface DocumentsViewProps {
  currentStudentName?: string;
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function DocumentsView({ database, setDatabase, currentRole, currentStudentName }: DocumentsViewProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>(database.documents[0]?.id || "");
  const [filterType, setFilterType] = useState<"ALL" | "Surat Perizinan" | "Sertifikat" | "Persyaratan Lomba" | "Biodata Siswa">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Signature states
  const [isSigning, setIsSigning] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<any>("Surat Perizinan");
  const [formEkskulId, setFormEkskulId] = useState("");
  const [formSiswaId, setFormSiswaId] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const isReadOnly = ["Orang Tua", "Siswa", "Kepala Sekolah"].includes(currentRole);
  const canApproveDocument = ["Koordinator Ekstrakurikuler", "Pembina Ekstrakurikuler"].includes(currentRole);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const selectedDoc = database.documents.find((d) => d.id === selectedDocId);

  // Canvas drawing handlers for Digital Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#047857"; // Emerald line
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const getPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  const saveSignature = () => {
    setSignatureSaved(true);
    setIsSigning(false);
    triggerAlert("✓ Tanda Tangan Digital berhasil dikunci & diaplikasikan!");
    
    if (selectedDoc) {
      const updatedDocs = database.documents.map((doc) =>
        doc.id === selectedDoc.id
          ? {
              ...doc,
              status: "Disetujui" as any,
              tandaTanganDigital: (currentStudentName || "Pengguna")
            }
          : doc
      );
      setDatabase({ ...database, documents: updatedDocs });
    }
  };

  useEffect(() => {
    if (isSigning && canvasRef.current) {
      clearCanvas();
    }
  }, [isSigning]);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const isStudentDoc = formType === "Persyaratan Lomba" || formType === "Biodata Siswa";
    const selectedStudent = database.students.find((s) => s.id === formSiswaId);

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      judul: formTitle,
      kategori: formType,
      ekskulId: formEkskulId,
      tanggalDibuat: new Date().toISOString().substring(0, 10),
      status: isStudentDoc ? "Disetujui" : "Pending",
      pengaju: isStudentDoc && selectedStudent ? `Siswa (${selectedStudent.nama})` : "Pembina Ekskul (Guru)",
      fileUrl: isStudentDoc ? "siswa_persyaratan_berkas.pdf" : "proposal_ekskul_archived.pdf",
      siswaId: isStudentDoc ? formSiswaId : undefined,
      namaSiswa: isStudentDoc && selectedStudent ? selectedStudent.nama : undefined,
      deskripsi: formDeskripsi || undefined
    };

    const updatedDb = { ...database };
    updatedDb.documents.push(newDoc);

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: isStudentDoc && selectedStudent ? selectedStudent.nama : "Pembina Ekskul",
      peran: isStudentDoc ? "Siswa" : "Pembina Ekstrakurikuler",
      aktivitas: "Upload Dokumen",
      detail: `Mengunggah berkas ${formType}: ${formTitle}${selectedStudent ? ` untuk santri ${selectedStudent.nama}` : ""}`
    });

    setDatabase(updatedDb);
    setSelectedDocId(newDoc.id);
    setShowCreateModal(false);
    setFormTitle("");
    setFormSiswaId("");
    setFormDeskripsi("");
    triggerAlert(isStudentDoc ? "✓ Berkas santri berhasil diunggah dan disimpan!" : "✓ Dokumen baru berhasil diajukan untuk disetujui pimpinan.");
  };

  const handleDocumentAction = (id: string, action: "Disetujui" | "Ditolak" | "Direvisi") => {
    const updatedDocs = database.documents.map((doc) =>
      doc.id === id ? { ...doc, status: action } : doc
    );

    const docObj = database.documents.find((d) => d.id === id);
    const updatedDb = { ...database, documents: updatedDocs };

    updatedDb.auditLogs.unshift({
      id: `log-${Date.now()}`,
      tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: (currentStudentName || "Pengguna") ,
      peran: currentRole,
      aktivitas: `Approval Dokumen`,
      detail: `Mengubah status dokumen "${docObj?.judul}" menjadi: ${action}`
    });

    setDatabase(updatedDb);
    triggerAlert(`✓ Status dokumen "${docObj?.judul}" berhasil diubah menjadi ${action}.`);
  };

  const handleSimulateReportDownload = () => {
    triggerAlert("Mengekstrak rekap laporan sarana & anggaran AEMS...");
    setTimeout(() => {
      triggerAlert("✓ Download Berhasil! Dokumen 'LPJ_Anggaran_Gabungan_AEMS_2026.pdf' berhasil disimpan.");
    }, 1500);
  };

  const handleDeleteDocument = (id: string) => {
    if (["Pelatih", "Pembina Ekstrakurikuler"].includes(currentRole)) {
      alert("Maaf, hak akses Anda dibatasi. Anda tidak dapat menghapus data ini.");
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.")) {
      const updatedDocs = database.documents.filter((d) => d.id !== id);
      const updatedDb = { ...database, documents: updatedDocs };
      setDatabase(updatedDb);
      setSelectedDocId("");
      triggerAlert("✓ Dokumen berhasil dihapus secara permanen.");
    }
  };

  const getFilteredDocs = () => {
    const q = searchQuery.toLowerCase();
    return (database.documents || []).filter((d) => {
      if (!d) return false;
      const title = (d.judul || d.nama || "").toLowerCase();
      const proposer = (d.pengaju || "Sistem").toLowerCase();
      const matchSearch = title.includes(q) || proposer.includes(q);
      
      const category = d.kategori || d.tipe || "Proposal";
      if (filterType === "ALL") return matchSearch;
      return (category === filterType) && matchSearch;
    });
  };

  const filteredDocs = getFilteredDocs();

  return (
    <div className="space-y-6">
      {/* Simulation Alert Banner */}
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
            Pusat Dokumen & Laporan Pertanggungjawaban
          </h2>
          <p className="text-xs text-gray-400">Verifikasi tanda tangan digital LPJ, rekap proposal anggaran kesiswaan</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateReportDownload}
            className="px-3.5 py-2 border border-gray-200 bg-white hover:text-maroon-500 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download size={14} />
            <span>Rekap Proposal LPJ (PDF)</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start"
            >
              <Plus size={15} />
              Unggah Berkas Baru
            </button>
          )}
        </div>
      </div>

      {/* Document filter tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterType === "ALL"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Semua Berkas ({database.documents.length})
        </button>
        <button
          onClick={() => setFilterType("Surat Perizinan")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterType === "Surat Perizinan"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Surat Perizinan
        </button>
        <button
          onClick={() => setFilterType("Persyaratan Lomba")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterType === "Persyaratan Lomba"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Persyaratan Lomba ({database.documents.filter((d) => (d.kategori || d.tipe) === "Persyaratan Lomba").length})
        </button>
        <button
          onClick={() => setFilterType("Biodata Siswa")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            filterType === "Biodata Siswa"
              ? "border-maroon-500 text-maroon-500"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Biodata Siswa ({database.documents.filter((d) => (d.kategori || d.tipe) === "Biodata Siswa").length})
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side File Lists (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Cari proposal/berkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl bg-surface-sunken border border-border outline-none placeholder-gray-400 text-gray-800"
            />
          </div>

          <div className="space-y-2 max-h-128 overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const eksName = database.extracurriculars.find((e) => e.id === doc.ekskulId)?.nama || "Ekskul";
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-start gap-3 ${
                    selectedDocId === doc.id
                      ? "bg-gold-500/10 border-gold-500 text-maroon-700"
                      : "bg-white border-border text-gray-600 hover:bg-surface-sunken"
                  }`}
                >
                  <FileText size={18} className="text-maroon-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-bold font-display truncate leading-tight">{doc.judul || doc.nama || "Dokumen Tanpa Judul"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                      <span>{doc.tanggalDibuat || doc.tanggalUpload}</span>
                      <span>•</span>
                      <span>{eksName}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 border-t border-gray-50 pt-1.5 w-full">
                      <span className="text-[10px] text-gray-400">Pengaju: {(doc.pengaju || "Sistem").split(" ")[0]}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          (doc.status || "Disetujui") === "Disetujui"
                            ? "bg-maroon-50 text-maroon-700"
                            : (doc.status || "Disetujui") === "Ditolak"
                            ? "bg-navy-100 text-navy-700"
                            : "bg-gold-100 text-gold-700"
                        }`}
                      >
                        {doc.status || "Disetujui"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side PDF & Digital Signature (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between min-h-128">
              
              {/* Top info and download */}
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-800 leading-snug">
                      {selectedDoc.judul || selectedDoc.nama || "Dokumen Tanpa Judul"}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Format Dokumen: {selectedDoc.kategori || selectedDoc.tipe || "Proposal"} (.pdf)</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerAlert("Mengunduh berkas fisik PDF...")}
                      className="p-2 rounded-xl bg-surface-sunken hover:bg-gray-100 text-gray-500 hover:text-maroon-500 transition-colors"
                      title="Unduh Berkas Fisik"
                    >
                      <Download size={15} />
                    </button>
                    {!isReadOnly && (
                      <>{canDelete && ( <button
                        onClick={() => handleDeleteDocument(selectedDoc.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Hapus Dokumen"
                      >
                        <Trash2 size={15} />
                      </button> )}</>
                    )}
                  </div>
                </div>

                {/* Simulated Document content page preview */}
                <div className="border border-dashed border-gray-200 rounded-2xl p-5 bg-surface-sunken text-xs text-gray-500 space-y-3 relative">
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-border pb-1.5">
                    <span>AEMS DOCUMENT CONTROL SECURE</span>
                    <span>No: DOC-{selectedDoc.id.split("-")[1] || "32918"}</span>
                  </div>
                  <p className="leading-relaxed italic">
                    {selectedDoc.deskripsi || "Lembar ini berisi berkas kelengkapan administrasi atau surat perizinan operasional ekstrakurikuler di SMAIT As-Syifa Boarding School Wanareja. Seluruh rincian berkas telah terverifikasi resmi."}
                  </p>

                  {selectedDoc.namaSiswa && (
                    <div className="my-2.5 p-3 rounded-xl bg-maroon-500/15 border border-emerald-500/20 text-maroon-700 flex items-center gap-2.5">
                      <User className="text-navy-500 shrink-0" size={18} />
                      <div>
                        <p className="font-bold text-[10px] uppercase tracking-wider text-maroon-500">Santri Terkait</p>
                        <p className="text-xs font-bold leading-tight mt-0.5">{selectedDoc.namaSiswa}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Kelas: {database.students.find(s => s.id === selectedDoc.siswaId)?.kelas || "XI IPA"} • Asrama: {database.students.find(s => s.id === selectedDoc.siswaId)?.asrama || "Asrama Wanareja"}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] font-bold text-gray-400">STATUS PERSETUJUAN (SIGN OFF WORKFLOW):</p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="border border-border p-2.5 rounded-xl bg-white flex items-center gap-2">
                      <CheckCircle size={15} className="text-maroon-400" />
                      <div>
                        <p className="text-[9px] text-gray-400 font-mono">1. PEMBINA GURU</p>
                        <p className="text-[10px] font-bold text-gray-800">Disetujui (Pembina)</p>
                      </div>
                    </div>
                    <div className="border border-border p-2.5 rounded-xl bg-white flex items-center gap-2">
                      {(selectedDoc.status || "Disetujui") === "Disetujui" ? (
                        <CheckCircle size={15} className="text-maroon-400" />
                      ) : (selectedDoc.status || "Disetujui") === "Ditolak" ? (
                        <XCircle size={15} className="text-navy-500" />
                      ) : (
                        <Clock size={15} className="text-yellow-500 animate-spin" />
                      )}
                      <div>
                        <p className="text-[9px] text-gray-400 font-mono">2. KOORDINATOR</p>
                        <p className="text-[10px] font-bold text-gray-800">
                          {(selectedDoc.status || "Disetujui") === "Disetujui" ? `Disetujui (${currentStudentName || "Pengguna"})` : (selectedDoc.status || "Disetujui") === "Ditolak" ? "Ditolak" : "Menunggu Verifikasi"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stamp & signature preview */}
                  {(selectedDoc.status || "Disetujui") === "Disetujui" && (
                    <div className="absolute bottom-4 right-4 flex flex-col items-center border border-emerald-500/30 p-1.5 rounded bg-maroon-500/10 rotate-[-5deg]">
                      <span className="text-[8px] text-maroon-500 font-bold tracking-wider font-mono uppercase">DISETUJUI AEMS</span>
                      <span className="text-[10px] font-display font-semibold italic text-maroon-700">{selectedDoc.tandaTanganDigital || (currentStudentName || "Pengguna")}</span>
                    </div>
                  )}
                </div>

                {/* Digital Signature Pad activator and buttons */}
                {(selectedDoc.status || "Disetujui") === "Pending" && canApproveDocument && (
                  <div className="border border-border p-4 rounded-2xl bg-surface-sunken/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <PenTool size={12} className="text-maroon-400" />
                        TANDA TANGAN DIGITAL KOORDINATOR
                      </span>
                      <button
                        onClick={() => setIsSigning(true)}
                        className="text-[10px] font-bold text-maroon-500 hover:underline"
                      >
                        Buka Pad Tanda Tangan
                      </button>
                    </div>

                    {isSigning ? (
                      <div className="space-y-3">
                        {/* Signature HTML5 Canvas */}
                        <div className="border border-gray-200 rounded-2xl bg-white p-2.5 relative">
                          <canvas
                            ref={canvasRef}
                            width={350}
                            height={120}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full bg-slate-50 rounded-xl cursor-crosshair touch-none"
                            title="Gambarkan tanda tangan Anda di sini"
                          />
                          <p className="absolute bottom-4 left-4 text-[9px] text-gray-400 font-mono pointer-events-none">
                            DRAW SIGNATURE AREA
                          </p>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="absolute bottom-4 right-4 text-[10px] font-bold text-navy-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="flex justify-end gap-2.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setIsSigning(false)}
                            className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-gray-500"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={saveSignature}
                            className="px-3.5 py-1.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold rounded-lg shadow"
                          >
                            Simpan & Bubuhkan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 text-xs font-bold pt-1">
                        <button
                          onClick={() => handleDocumentAction(selectedDoc.id, "Disetujui")}
                          className="flex-1 py-2 bg-maroon-500 hover:bg-maroon-500 text-white rounded-xl shadow transition-all flex items-center justify-center gap-1"
                        >
                          <Check size={14} />
                          Setujui Cepat
                        </button>
                        <button
                          onClick={() => handleDocumentAction(selectedDoc.id, "Ditolak")}
                          className="px-4 py-2 border border-navy-200 text-navy-500 rounded-xl transition-all hover:bg-navy-50"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface-sunken/30 border-t border-border text-center text-xs text-gray-400">
                AEMS menggunakan Tanda Tangan Digital Kriptografis yang tervalidasi asrama untuk keamanan berkas LPJ.
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-surface-sunken border border-border rounded-2xl text-gray-400">
              Tidak ada dokumen terpilih. Silakan unggah proposal perdana Anda.
            </div>
          )}
        </div>

      </div>

      {/* Upload document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wider">
                Unggah Berkas Baru ke AEMS
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-surface-sunken text-gray-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateDocument} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Judul Dokumen / Berkas</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Surat Tugas Pembina atau Berkas Persyaratan Lomba"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Kategori Berkas</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="Surat Perizinan">Surat Perizinan</option>
                    <option value="Sertifikat">Sertifikat Santri</option>
                    <option value="Persyaratan Lomba">Persyaratan Lomba</option>
                    <option value="Biodata Siswa">Biodata Diri Siswa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Pilih Ekstrakurikuler</label>
                  <select
                    value={formEkskulId}
                    onChange={(e) => setFormEkskulId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="">Umum / Semua</option>
                    {database.extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>{e.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional inputs for student document categories */}
              {(formType === "Persyaratan Lomba" || formType === "Biodata Siswa") && (
                <div className="space-y-3 border-l-2 border-emerald-500 pl-3 py-1 bg-maroon-500/5 p-3 rounded-xl">
                  <div>
                    <label className="block text-maroon-700 font-bold mb-1">
                      Pilih Siswa (Santri) Terkait
                    </label>
                    <select
                      value={formSiswaId}
                      onChange={(e) => setFormSiswaId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {database.students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.nama} ({student.kelas})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-maroon-700 font-bold mb-1">
                      Catatan / Deskripsi Dokumen
                    </label>
                    <textarea
                      placeholder={
                        formType === "Biodata Siswa"
                          ? "e.g., Berkas pas foto, surat persetujuan wali santri, dan riwayat kesehatan asrama."
                          : "e.g., Dokumen kartu pelajar, surat rekomendasi kesiswaan, dan sertifikat vaksin lomba."
                      }
                      value={formDeskripsi}
                      onChange={(e) => setFormDeskripsi(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl h-16 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Drag and Drop area simulator */}
              <div className="border-2 border-dashed border-gray-200 p-8 rounded-2xl text-center bg-surface-sunken">
                <FileText className="text-gray-400 mx-auto mb-2" size={24} />
                <p className="font-bold text-gray-700">Klik untuk jelajahi file komputer Anda</p>
                <p className="text-[10px] text-gray-400 mt-1">Dukung format PDF, DOCX, atau ZIP (Maksimal 12MB)</p>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold rounded-xl shadow"
                >
                  Kirim & Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
