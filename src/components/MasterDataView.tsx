import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Check, User, Activity, Phone, Mail, Home, MapPin, Clock, BookOpen, DollarSign, Target, Key, Info, Download } from "lucide-react";
import { AppDatabase, Extracurricular, Student, Coach, Supervisor, Role } from "../types";
import ConfirmModal from "./ConfirmModal";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";

interface MasterDataViewProps {
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
  initialSubTab?: "ekskul" | "siswa" | "pelatih" | "pembina" | "akun";
  currentStudentId?: string;
}

export default function MasterDataView({
  database,
  setDatabase,
  currentRole,
  initialSubTab = "ekskul",
  currentStudentId
}: MasterDataViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ekskul" | "siswa" | "pelatih" | "pembina" | "akun">(initialSubTab as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<{title: string; message: string; type: "success" | "error"} | null>(null);
  
  // Modal/Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailModalEkskul, setDetailModalEkskul] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "", // "delete" or "save"
    type: "",
    id: "",
    title: "",
    message: ""
  });

  // Form Fields State
  const [ekskulForm, setEkskulForm] = useState<Partial<Extracurricular>>({
    nama: "", kategori: "Olahraga", hari: "Sabtu", jam: "16:00 - 17:30", tempat: "",
    pelatihId: "", pembinaId: "", kuota: 30, status: "Aktif", deskripsi: "", logo: "Target", galeri: []
  });
  
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    nama: "", kelas: "X-A IPA", asrama: "", noHpOrtu: "", ekskulIds: [], riwayat: []
  });

  const [coachForm, setCoachForm] = useState<Partial<Coach>>({
    nama: "", keahlian: "", noHp: "", email: "", honor: 1000000, status: "Aktif", riwayatMengajar: []
  });

  const [supervisorForm, setSupervisorForm] = useState<Partial<Supervisor>>({
    nama: "", jabatan: "", kontak: "", ekskulBinaan: []
  });

  const [userForm, setUserForm] = useState({
    nama: "", username: "", password: "", role: "Siswa" as Role, linkedEntityId: ""
  });

  const isReadOnly = ["Orang Tua", "Siswa", "Wali Kelas", "Kepala Sekolah"].includes(currentRole);

  const resetForms = () => {
    setEditId(null);
    setEkskulForm({
      nama: "", kategori: "Olahraga", hari: "Sabtu", jam: "16:00 - 17:30", tempat: "",
      pelatihId: "", pembinaId: "", kuota: 30, status: "Aktif", deskripsi: "", logo: "Target", galeri: []
    });
    setStudentForm({
      nama: "", kelas: "X-A IPA", asrama: "", noHpOrtu: "", ekskulIds: [], riwayat: []
    });
    setCoachForm({
      nama: "", keahlian: "", noHp: "", email: "", honor: 1000000, status: "Aktif", riwayatMengajar: []
    });
    setSupervisorForm({
      nama: "", jabatan: "", kontak: "", ekskulBinaan: []
    });
    setUserForm({
      nama: "", username: "", password: "", role: "Siswa", linkedEntityId: ""
    });
  };

  const handleEdit = (type: string, id: string) => {
    setEditId(id);
    if (type === "ekskul") {
      const item = database.extracurriculars.find((e) => e.id === id);
      if (item) setEkskulForm(item);
    } else if (type === "siswa") {
      const item = database.students.find((s) => s.id === id);
      if (item) setStudentForm(item);
    } else if (type === "pelatih") {
      const item = database.coaches.find((c) => c.id === id);
      if (item) setCoachForm(item);
    } else if (type === "pembina") {
      const item = database.supervisors.find((p) => p.id === id);
      if (item) setSupervisorForm(item);
    } else if (type === "akun") {
      const item = (database.users || []).find((u) => u.id === id);
      if (item) {
        setUserForm({
          nama: item.nama,
          username: item.username,
          password: item.password,
          role: item.role,
          linkedEntityId: item.linkedEntityId || ""
        });
      }
    }
    setShowFormModal(true);
  };

  const handleDelete = (type: string, id: string) => {
    setConfirmModal({
      isOpen: true,
      action: "delete",
      type,
      id,
      title: "Konfirmasi Hapus Data",
      message: "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan dan akan terhapus dari sistem."
    });
  };

  const executeDelete = () => {
    const { type, id } = confirmModal;
    const updatedDb = { ...database };
    let actionLog = "";
    if (type === "ekskul") {
      const eksToDelete = updatedDb.extracurriculars.find((e) => e.id === id);
      updatedDb.extracurriculars = updatedDb.extracurriculars.filter((e) => e.id !== id);
      
      if (eksToDelete) {
        // Cascade delete: remove this ekskul from all supervisors' ekskulBinaan
        updatedDb.supervisors = updatedDb.supervisors.map(p => ({
          ...p,
          ekskulBinaan: p.ekskulBinaan.filter(nama => nama !== eksToDelete.nama)
        }));
      }
      
      actionLog = `Menghapus data Ekstrakurikuler ID: ${id}`;
    } else if (type === "siswa") {
      updatedDb.students = updatedDb.students.filter((s) => s.id !== id);
      actionLog = `Menghapus data Siswa ID: ${id}`;
    } else if (type === "pelatih") {
      updatedDb.coaches = updatedDb.coaches.filter((c) => c.id !== id);
      actionLog = `Menghapus data Pelatih ID: ${id}`;
    } else if (type === "pembina") {
      updatedDb.supervisors = updatedDb.supervisors.filter((p) => p.id !== id);
      actionLog = `Menghapus data Pembina ID: ${id}`;
    } else if (type === "akun") {
      updatedDb.users = (updatedDb.users || []).filter((u) => u.id !== id);
      actionLog = `Menghapus Akun Pengguna ID: ${id}`;
    }

    // Add audit log
    if (!updatedDb.auditLogs) updatedDb.auditLogs = [];
    updatedDb.auditLogs = [
      {
        id: `log-${Date.now()}`,
        tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
        user: "Koordinator / Admin",
        peran: currentRole,
        aktivitas: "Hapus Master Data",
        detail: actionLog
      },
      ...updatedDb.auditLogs
    ];

    setDatabase(updatedDb);
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      action: "save",
      type: activeSubTab,
      id: editId || "",
      title: editId ? "Konfirmasi Simpan Perubahan" : "Konfirmasi Tambah Data",
      message: "Apakah Anda yakin data yang dimasukkan sudah benar? Data akan disimpan ke dalam sistem."
    });
  };

  const executeSave = () => {
    const updatedDb = { ...database };
    let actionLog = "";

    if (activeSubTab === "ekskul") {
      if (editId) {
        updatedDb.extracurriculars = updatedDb.extracurriculars.map((item) =>
          item.id === editId ? ({ ...item, ...ekskulForm } as Extracurricular) : item
        );
        actionLog = `Mengedit data Ekstrakurikuler: ${ekskulForm.nama}`;
      } else {
        const newItem: Extracurricular = {
          ...(ekskulForm as Extracurricular),
          id: `ekskul-${Date.now()}`
        };
        updatedDb.extracurriculars.push(newItem);
        actionLog = `Menambah Ekstrakurikuler Baru: ${newItem.nama}`;
      }
    } else if (activeSubTab === "siswa") {
      if (editId) {
        updatedDb.students = updatedDb.students.map((item) =>
          item.id === editId ? ({ ...item, ...studentForm } as Student) : item
        );
        actionLog = `Mengedit data Siswa: ${studentForm.nama}`;

        // Sync companion user name
        updatedDb.users = (updatedDb.users || []).map((u) =>
          u.linkedEntityId === editId ? { ...u, nama: studentForm.nama } : u
        );
      } else {
        const newId = `siswa-${Date.now()}`;
        const newItem: Student = {
          ...(studentForm as Student),
          id: newId,
          riwayat: [{ tanggal: new Date().toISOString().substring(0, 10), kegiatan: "Pendaftaran Akun", keterangan: "Siswa bergabung ke sistem AEMS." }]
        };
        updatedDb.students.push(newItem);
        actionLog = `Menambah Siswa Baru: ${newItem.nama}`;

        // Create companion user account
        const companionUser = {
          id: `user-${Date.now()}`,
          username: newItem.nama.toLowerCase().replace(/\s+/g, ""),
          password: "siswa123",
          nama: newItem.nama,
          role: "Siswa" as const,
          linkedEntityId: newId
        };
        updatedDb.users = [...(updatedDb.users || []), companionUser];
      }
    } else if (activeSubTab === "pelatih") {
      if (editId) {
        updatedDb.coaches = updatedDb.coaches.map((item) =>
          item.id === editId ? ({ ...item, ...coachForm } as Coach) : item
        );
        actionLog = `Mengedit data Pelatih: ${coachForm.nama}`;

        // Sync companion user name
        updatedDb.users = (updatedDb.users || []).map((u) =>
          u.linkedEntityId === editId ? { ...u, nama: coachForm.nama } : u
        );
      } else {
        const newId = `pelatih-${Date.now()}`;
        const newItem: Coach = {
          ...(coachForm as Coach),
          id: newId,
          riwayatMengajar: []
        };
        updatedDb.coaches.push(newItem);
        actionLog = `Menambah Pelatih Baru: ${newItem.nama}`;

        // Create companion user account
        const companionUser = {
          id: `user-${Date.now()}`,
          username: newItem.nama.toLowerCase().replace(/\s+/g, ""),
          password: "pelatih123",
          nama: newItem.nama,
          role: "Pelatih" as const,
          linkedEntityId: newId
        };
        updatedDb.users = [...(updatedDb.users || []), companionUser];
      }
    } else if (activeSubTab === "pembina") {
      if (editId) {
        updatedDb.supervisors = updatedDb.supervisors.map((item) =>
          item.id === editId ? ({ ...item, ...supervisorForm } as Supervisor) : item
        );
        actionLog = `Mengedit data Pembina: ${supervisorForm.nama}`;

        // Sync companion user name
        updatedDb.users = (updatedDb.users || []).map((u) =>
          u.linkedEntityId === editId ? { ...u, nama: supervisorForm.nama } : u
        );
      } else {
        const newId = `pembina-${Date.now()}`;
        const newItem: Supervisor = {
          ...(supervisorForm as Supervisor),
          id: newId,
          ekskulBinaan: []
        };
        updatedDb.supervisors.push(newItem);
        actionLog = `Menambah Pembina Baru: ${newItem.nama}`;

        // Create companion user account
        const companionUser = {
          id: `user-${Date.now()}`,
          username: newItem.nama.toLowerCase().replace(/\s+/g, ""),
          password: "pembina123",
          nama: newItem.nama,
          role: "Pembina Ekstrakurikuler" as const,
          linkedEntityId: newId
        };
        updatedDb.users = [...(updatedDb.users || []), companionUser];
      }
    } else if (activeSubTab === "akun") {
      if (editId) {
        const oldUser = (updatedDb.users || []).find((u) => u.id === editId);
        let finalLinkedEntityId = userForm.linkedEntityId;

        // Auto-create linked entity if role changed to one of the main actors
        if (oldUser && oldUser.role !== userForm.role) {
          // 1. Delete the old entity
          if (oldUser.role === "Siswa") {
            updatedDb.students = updatedDb.students.filter(s => s.id !== oldUser.linkedEntityId);
          } else if (oldUser.role === "Pelatih") {
            updatedDb.coaches = updatedDb.coaches.filter(c => c.id !== oldUser.linkedEntityId);
          } else if (oldUser.role === "Pembina Ekstrakurikuler") {
            updatedDb.supervisors = updatedDb.supervisors.filter(s => s.id !== oldUser.linkedEntityId);
          }

          // 2. Create the new entity
          const role = userForm.role;
          if (role === "Pembina Ekstrakurikuler") {
            finalLinkedEntityId = `pembina-${Date.now()}`;
            updatedDb.supervisors.push({
              id: finalLinkedEntityId,
              nama: userForm.nama,
              jabatan: "Pembina Baru",
              kontak: "-",
              ekskulBinaan: []
            });
          } else if (role === "Pelatih") {
            finalLinkedEntityId = `pelatih-${Date.now()}`;
            updatedDb.coaches.push({
              id: finalLinkedEntityId,
              nama: userForm.nama,
              keahlian: "-",
              noHp: "-",
              email: "-",
              honor: 0,
              status: "Aktif",
              riwayatMengajar: []
            });
          } else if (role === "Siswa") {
            finalLinkedEntityId = `siswa-${Date.now()}`;
            updatedDb.students.push({
              id: finalLinkedEntityId,
              nama: userForm.nama,
              kelas: "-",
              asrama: "-",
              noHpOrtu: "-",
              ekskulIds: [],
              riwayat: []
            });
          } else {
            // For other roles (Admin, Kepala Sekolah, etc) which don't have linked entities
            finalLinkedEntityId = undefined;
          }
        }

        updatedDb.users = (updatedDb.users || []).map((item) =>
          item.id === editId ? { ...item, ...userForm, linkedEntityId: finalLinkedEntityId } : item
        );
        actionLog = `Mengedit Akun Pengguna: ${userForm.username}`;
      } else {
        let finalLinkedEntityId = undefined;
        const role = userForm.role;
        
        if (role === "Pembina Ekstrakurikuler") {
          finalLinkedEntityId = `pembina-${Date.now()}`;
          updatedDb.supervisors.push({
            id: finalLinkedEntityId,
            nama: userForm.nama,
            jabatan: "Pembina Baru",
            kontak: "-",
            ekskulBinaan: []
          });
        } else if (role === "Pelatih") {
          finalLinkedEntityId = `pelatih-${Date.now()}`;
          updatedDb.coaches.push({
            id: finalLinkedEntityId,
            nama: userForm.nama,
            keahlian: "-",
            noHp: "-",
            email: "-",
            honor: 0,
            status: "Aktif",
            riwayatMengajar: []
          });
        } else if (role === "Siswa") {
          finalLinkedEntityId = `siswa-${Date.now()}`;
          updatedDb.students.push({
            id: finalLinkedEntityId,
            nama: userForm.nama,
            kelas: "-",
            asrama: "-",
            noHpOrtu: "-",
            ekskulIds: [],
            riwayat: []
          });
        }

        const newItem = {
          ...userForm,
          id: `user-${Date.now()}`,
          linkedEntityId: finalLinkedEntityId
        };
        updatedDb.users = [...(updatedDb.users || []), newItem];
        actionLog = `Menambah Akun Pengguna Baru: ${newItem.username}`;
      }
    }

    // Add audit log
    if (!updatedDb.auditLogs) updatedDb.auditLogs = [];
    updatedDb.auditLogs = [
      {
        id: `log-${Date.now()}`,
        tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
        user: "Koordinator / Admin",
        peran: currentRole,
        aktivitas: editId ? "Edit Master Data" : "Tambah Master Data",
        detail: actionLog
      },
      ...updatedDb.auditLogs
    ];

    setDatabase(updatedDb);
    setShowFormModal(false);
    setConfirmModal({ ...confirmModal, isOpen: false });
    resetForms();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processData = (data: any[]) => {
      // expected columns: Nama Siswa, Kelas, Asrama, HP Orang Tua
      const updatedDb = { ...database };
      const newStudents: Student[] = [];
      const newUsers: typeof updatedDb.users = [];

      data.forEach((row, index) => {
        const nama = row["Nama Siswa"] || row["nama"] || Object.values(row)[0];
        const kelas = row["Kelas"] || row["kelas"] || Object.values(row)[1] || "-";
        const asrama = row["Asrama"] || row["asrama"] || Object.values(row)[2] || "-";
        const noHpOrtu = row["HP Orang Tua"] || row["No HP"] || row["no_hp"] || Object.values(row)[3] || "-";

        if (nama) {
          const newId = `siswa-${Date.now()}-${index}`;
          newStudents.push({
            id: newId,
            nama: String(nama).trim(),
            kelas: String(kelas).trim(),
            asrama: String(asrama).trim(),
            noHpOrtu: String(noHpOrtu).trim(),
            ekskulIds: [],
            riwayat: [{ tanggal: new Date().toISOString().substring(0, 10), kegiatan: "Pendaftaran Akun", keterangan: "Siswa bergabung ke sistem AEMS via Upload." }]
          });

          newUsers?.push({
            id: `user-${Date.now()}-${index}`,
            username: String(nama).toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15) + Math.floor(Math.random() * 100),
            password: "siswa123",
            nama: String(nama).trim(),
            role: "Siswa",
            linkedEntityId: newId
          });
        }
      });

      if (newStudents.length > 0) {
        updatedDb.students = [...updatedDb.students, ...newStudents];
        updatedDb.users = [...(updatedDb.users || []), ...(newUsers || [])];
        
        if (!updatedDb.auditLogs) updatedDb.auditLogs = [];
        updatedDb.auditLogs = [
          {
            id: `log-${Date.now()}`,
            tanggal: new Date().toISOString().replace("T", " ").substring(0, 19),
            user: "Koordinator / Admin",
            peran: currentRole,
            aktivitas: "Upload Master Data",
            detail: `Menambah ${newStudents.length} Data Siswa via Upload File`
          },
          ...updatedDb.auditLogs
        ];
        
        setDatabase(updatedDb);
        setToastMessage({ title: "Berhasil", message: `Menambahkan ${newStudents.length} data siswa secara massal!`, type: "success" });
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage({ title: "Gagal", message: "Tidak ada data valid yang ditemukan dalam file.", type: "error" });
        setTimeout(() => setToastMessage(null), 4000);
      }
      
      // Reset input
      e.target.value = '';
    };

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: (error: any) => {
          console.error("CSV Parse Error:", error);
          setToastMessage({ title: "Gagal", message: "Gagal membaca file CSV.", type: "error" });
          setTimeout(() => setToastMessage(null), 4000);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processData(data);
        } catch (err) {
          console.error("Excel Parse Error:", err);
          setToastMessage({ title: "Gagal", message: "Gagal membaca file Excel.", type: "error" });
          setTimeout(() => setToastMessage(null), 4000);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setToastMessage({ title: "Gagal", message: "Format file tidak didukung. Harap upload CSV atau XLSX.", type: "error" });
      setTimeout(() => setToastMessage(null), 4000);
      e.target.value = '';
    }
  };

  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();
    switch (activeSubTab) {
      case "ekskul":
        return database.extracurriculars.filter(
          (e) => e.nama.toLowerCase().includes(q) || e.deskripsi.toLowerCase().includes(q)
        );
      case "siswa":
        return database.students.filter(
          (s) => s.nama.toLowerCase().includes(q) || s.asrama.toLowerCase().includes(q)
        );
      case "pelatih":
        return database.coaches.filter(
          (c) => c.nama.toLowerCase().includes(q) || c.keahlian.toLowerCase().includes(q)
        );
      case "pembina":
        return database.supervisors.filter(
          (p) => p.nama.toLowerCase().includes(q) || p.jabatan.toLowerCase().includes(q)
        );
      case "akun":
        return (database.users || []).filter(
          (u) =>
            u.nama.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );
    }
  };

  const filteredItems = getFilteredData();

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-start gap-3 w-80 ${
              toastMessage.type === "success" 
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className={`mt-0.5 ${toastMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {toastMessage.type === "success" ? <Check size={18} /> : <Info size={18} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{toastMessage.title}</h4>
              <p className="text-xs mt-1 opacity-90">{toastMessage.message}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Tabs Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
            Master Data Ekstrakurikuler
          </h2>
          <p className="text-xs text-gray-400">Kelola seluruh entitas dan sumber daya AEMS SMAIT As-Syifa</p>
        </div>

        {!isReadOnly && !(activeSubTab === "ekskul" && ["Pelatih", "Pembina Ekstrakurikuler"].includes(currentRole)) && (
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => {
                resetForms();
                setShowFormModal(true);
              }}
              className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              {activeSubTab === "ekskul" ? "Tambah Data Ekskul" : 
               activeSubTab === "siswa" ? "Tambah Data Siswa" : 
               activeSubTab === "pelatih" ? "Tambah Data Pelatih" : 
               activeSubTab === "pembina" ? "Tambah Data Pembina" : 
               "Tambah Akun Portal"}
            </button>
            {activeSubTab === "siswa" && (
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer">
                <Download size={15} className="rotate-180" />
                Upload Data
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Tab Selectors */}
      {currentRole !== "Siswa" && (
        <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => { setActiveSubTab("ekskul"); setSearchQuery(""); }}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === "ekskul"
              ? "border-maroon-500 text-maroon-500 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Data Ekstrakurikuler
        </button>
        <button
          onClick={() => { setActiveSubTab("siswa"); setSearchQuery(""); }}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === "siswa"
              ? "border-maroon-500 text-maroon-500 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Data Siswa
        </button>
        <button
          onClick={() => { setActiveSubTab("pelatih"); setSearchQuery(""); }}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === "pelatih"
              ? "border-maroon-500 text-maroon-500 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Data Pelatih
        </button>
        <button
          onClick={() => { setActiveSubTab("pembina"); setSearchQuery(""); }}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === "pembina"
              ? "border-maroon-500 text-maroon-500 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
           Data Pembina
        </button>
        {currentRole === "Koordinator Ekstrakurikuler" && (
          <button
            onClick={() => { setActiveSubTab("akun"); setSearchQuery(""); }}
            className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeSubTab === "akun"
                ? "border-maroon-500 text-maroon-500 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Akun Portal
          </button>
        )}
      </div>
      )}

      {/* Filter and Search Bar */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder={`Cari ${activeSubTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Grid List View */}
      {activeSubTab === "ekskul" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredItems as Extracurricular[]).map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl shadow-sm border border-border hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-maroon-50 flex items-center justify-center text-2xl shadow-inner">
                    {e.logo === "Target" ? <Target className="text-gold-500" size={24} /> : <Target className="text-gold-500" size={24} />}
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      e.status === "Aktif"
                        ? "bg-maroon-50 text-maroon-700"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-gold-600 uppercase tracking-widest">
                    {e.kategori}
                  </span>
                  <h3 className="font-display font-bold text-base text-gray-800 mt-1">
                    {e.nama}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {e.deskripsi}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-50 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-maroon-500 shrink-0" />
                    <span>{e.hari}, {e.jam}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-maroon-500 shrink-0" />
                    <span className="truncate">{e.tempat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-gold-500 shrink-0" />
                    <span className="truncate font-medium">
                      Pelatih: {database.coaches.find((c) => c.id === e.pelatihId)?.nama || "Belum ditentukan"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-surface-sunken border-t border-border flex items-center justify-between text-xs">
                <span className="text-gray-400">Kuota: <strong className="text-gray-700">{e.kuota} Santri</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailModalEkskul(e.id)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:text-navy-500 transition-colors"
                    title="Detail & Data Siswa"
                  >
                    <Info size={12} />
                  </button>

                  {currentRole === "Siswa" && currentStudentId && (
                    <button
                      onClick={() => {
                        const student = database.students.find(s => s.id === currentStudentId);
                        if (!student) return;
                        const isEnrolled = student.ekskulIds.includes(e.id);
                        let updatedEkskulIds = student.ekskulIds;
                        if (isEnrolled) {
                          updatedEkskulIds = student.ekskulIds.filter(id => id !== e.id);
                        } else {
                          updatedEkskulIds = [...student.ekskulIds, e.id];
                        }
                        const updatedStudents = database.students.map(s => s.id === currentStudentId ? { ...s, ekskulIds: updatedEkskulIds } : s);
                        setDatabase({ ...database, students: updatedStudents });
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all shadow-sm ${
                        database.students.find(s => s.id === currentStudentId)?.ekskulIds.includes(e.id)
                          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "bg-maroon-500 text-white hover:bg-maroon-600"
                      }`}
                    >
                      {database.students.find(s => s.id === currentStudentId)?.ekskulIds.includes(e.id) ? "Berhenti" : "Ikut Ekskul"}
                    </button>
                  )}

                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => handleEdit("ekskul", e.id)}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 hover:text-maroon-500 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      {!["Pelatih", "Pembina Ekstrakurikuler"].includes(currentRole) && (
                        <button
                          onClick={() => handleDelete("ekskul", e.id)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:text-navy-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "siswa" && (() => {
        const students = filteredItems as Student[];
        
        // Group by kelas
        const groupedStudents = students.reduce((acc, student) => {
          const kelas = student.kelas || "Tanpa Kelas";
          if (!acc[kelas]) acc[kelas] = [];
          acc[kelas].push(student);
          return acc;
        }, {} as Record<string, Student[]>);

        // Sort classes alphabetically
        const sortedClasses = Object.keys(groupedStudents).sort((a, b) => a.localeCompare(b));

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-sunken border-b border-border text-[10px] font-mono tracking-wider text-gray-400 font-semibold uppercase">
                    <th className="p-4">Nama Santri</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">Gedung Asrama</th>
                    <th className="p-4">HP Wali / Orang Tua</th>
                    <th className="p-4">Ekstrakurikuler</th>
                    {!isReadOnly && <th className="p-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {sortedClasses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada data siswa yang ditemukan.</td>
                    </tr>
                  )}
                  {sortedClasses.map((kelas) => {
                    // Sort students by name alphabetically within the class
                    const sortedStudents = groupedStudents[kelas].sort((a, b) => a.nama.localeCompare(b.nama));
                    
                    return (
                      <React.Fragment key={kelas}>
                        <tr className="bg-gray-50/80 border-y border-gray-100">
                          <td colSpan={6} className="p-3 pl-4 font-bold text-gray-700 text-[11px] uppercase tracking-wider">
                            Kelas {kelas} <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[9px]">{sortedStudents.length} Siswa</span>
                          </td>
                        </tr>
                        {sortedStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-surface-sunken transition-colors">
                            <td className="p-4 font-bold text-gray-800">{s.nama}</td>
                            <td className="p-4">{s.kelas}</td>
                            <td className="p-4 flex items-center gap-1.5">
                              <Home size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-44">{s.asrama}</span>
                            </td>
                            <td className="p-4 font-mono">{s.noHpOrtu}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {s.ekskulIds.map((eid) => {
                                  const name = database.extracurriculars.find((e) => e.id === eid)?.nama;
                                  return (
                                    <span
                                      key={eid}
                                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-maroon-50 text-maroon-700 border border-maroon-100 shrink-0"
                                    >
                                      {name || "Ekskul"}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            {!isReadOnly && (
                              <td className="p-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => handleEdit("siswa", s.id)}
                                    className="p-1.5 rounded-lg border border-border hover:text-maroon-500 transition-colors bg-white"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete("siswa", s.id)}
                                    className="p-1.5 rounded-lg border border-border hover:text-navy-500 transition-colors bg-white"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {activeSubTab === "pelatih" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(filteredItems as Coach[]).map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-sm border border-border p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold font-display text-sm">
                      {c.nama[0]}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-gray-800">
                        {c.nama}
                      </h4>
                      <p className="text-[10px] font-mono text-gold-600 font-semibold uppercase mt-0.5">
                        {c.keahlian}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      c.status === "Aktif"
                        ? "bg-maroon-50 text-maroon-700"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-gray-400" />
                    <span className="font-mono">{c.noHp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-gray-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <DollarSign size={12} className="text-maroon-400" />
                    <span className="font-semibold text-maroon-600">
                      Honor per Pertemuan: Rp {c.honor.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3.5 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400">Terdaftar mengajar aktif</span>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit("pelatih", c.id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:text-maroon-500 transition-colors bg-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete("pelatih", c.id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:text-navy-500 transition-colors bg-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "pembina" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredItems as Supervisor[]).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-border p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-maroon-500/10 text-maroon-500 flex items-center justify-center font-bold text-sm shrink-0">
                    
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-gray-800">
                      {p.nama}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.jabatan}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-gray-400 shrink-0" />
                    <span className="font-mono">{p.kontak}</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Binaan Ekskul:</p>
                    <div className="flex flex-wrap gap-1">
                      {p.ekskulBinaan.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-maroon-50 text-maroon-700 border border-maroon-100 font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end text-xs">
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit("pembina", p.id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:text-maroon-500 transition-colors bg-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete("pembina", p.id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:text-navy-500 transition-colors bg-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "akun" && (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-sunken border-b border-border text-[10px] font-mono tracking-wider text-gray-400 font-semibold uppercase">
                  <th className="p-4">Nama Pengguna (Akun)</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Kata Sandi</th>
                  <th className="p-4">Otoritas Peran</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {((filteredItems || []) as any[]).map((u) => (
                  <tr key={u.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="p-4 font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Key className="text-maroon-500" size={16} />
                        <div>
                          <p className="font-bold text-gray-800">{u.nama}</p>
                          <p className="text-[10px] text-gray-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-maroon-500">{u.username}</td>
                    <td className="p-4">
                      <code className="px-2 py-1 bg-slate-100 rounded font-mono text-xs select-all text-gray-800">
                        {u.password}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border ${
                        u.role === "Koordinator Ekstrakurikuler"
                          ? "bg-navy-50 text-navy-600 border-navy-100"
                          : u.role === "Kepala Sekolah"
                          ? "bg-navy-50 text-navy-600 border-navy-100"
                          : u.role === "Pelatih"
                          ? "bg-gold-50 text-gold-600 border-gold-100"
                          : u.role === "Pembina Ekstrakurikuler"
                          ? "bg-maroon-50 text-maroon-600 border-maroon-100"
                          : "bg-maroon-50 text-maroon-600 border-maroon-100"
                      }`}>
                        {u.role === "Koordinator Ekstrakurikuler" ? "Admin / Koord" : u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEdit("akun", u.id)}
                          className="p-1.5 rounded-lg border border-border hover:text-maroon-500 transition-colors bg-white"
                          title="Ubah Akun"
                        >
                          <Edit2 size={12} />
                        </button>
                        {u.username !== "reza" && (
                          <button
                            onClick={() => handleDelete("akun", u.id)}
                            className="p-1.5 rounded-lg border border-border hover:text-navy-500 transition-colors bg-white"
                            title="Hapus Akun"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(filteredItems || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      Tidak ada akun pengguna ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Form Modal overlay */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-gray-800 uppercase tracking-wide">
                {editId ? "Edit" : "Tambah"} Data {activeSubTab.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl hover:bg-surface-sunken text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {activeSubTab === "ekskul" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Ekskul</label>
                      <input
                        type="text"
                        required
                        value={ekskulForm.nama}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, nama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                      <select
                        value={ekskulForm.kategori}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, kategori: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="Olahraga">Olahraga</option>
                        <option value="Sains & Teknologi">Sains & Teknologi</option>
                        <option value="Seni & Budaya">Seni & Budaya</option>
                        <option value="Keagamaan">Keagamaan</option>
                        <option value="Akademik">Akademik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Hari</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Sabtu"
                        value={ekskulForm.hari}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, hari: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Jam Operasional</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 08:00 - 10:00"
                        value={ekskulForm.jam}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, jam: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tempat</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Lapangan Utama"
                        value={ekskulForm.tempat}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, tempat: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Pelatih Penanggungjawab</label>
                      <select
                        value={ekskulForm.pelatihId}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, pelatihId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="">Pilih Pelatih</option>
                        {database.coaches.map((c) => (
                          <option key={c.id} value={c.id}>{c.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Pembina Guru</label>
                      <select
                        value={ekskulForm.pembinaId}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, pembinaId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="">Pilih Pembina</option>
                        {database.supervisors.map((p) => (
                          <option key={p.id} value={p.id}>{p.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Kuota Santri</label>
                      <input
                        type="number"
                        value={ekskulForm.kuota}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, kuota: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Status Keaktifan</label>
                      <select
                        value={ekskulForm.status}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Deskripsi Kegiatan</label>
                      <textarea
                        rows={3}
                        value={ekskulForm.deskripsi}
                        onChange={(e) => setEkskulForm({ ...ekskulForm, deskripsi: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSubTab === "siswa" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap Santri</label>
                      <input
                        type="text"
                        required
                        value={studentForm.nama}
                        onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Kelas</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., XI-A IPA"
                        value={studentForm.kelas}
                        onChange={(e) => setStudentForm({ ...studentForm, kelas: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Gedung / Kamar Asrama</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Shalahuddin Al-Ayyubi Kamar 4"
                        value={studentForm.asrama}
                        onChange={(e) => setStudentForm({ ...studentForm, asrama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">No HP Orang Tua / Wali</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., +62812345678"
                        value={studentForm.noHpOrtu}
                        onChange={(e) => setStudentForm({ ...studentForm, noHpOrtu: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSubTab === "pelatih" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap Pelatih</label>
                      <input
                        type="text"
                        required
                        value={coachForm.nama}
                        onChange={(e) => setCoachForm({ ...coachForm, nama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Keahlian & Lisensi</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Pelatih Berlisensi PERPANI"
                        value={coachForm.keahlian}
                        onChange={(e) => setCoachForm({ ...coachForm, keahlian: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">No HP Kontak</label>
                      <input
                        type="text"
                        required
                        value={coachForm.noHp}
                        onChange={(e) => setCoachForm({ ...coachForm, noHp: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={coachForm.email}
                        onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Honorarium per Pertemuan (IDR)</label>
                      <input
                        type="number"
                        required
                        value={coachForm.honor}
                        onChange={(e) => setCoachForm({ ...coachForm, honor: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Status Keaktifan</label>
                      <select
                        value={coachForm.status}
                        onChange={(e) => setCoachForm({ ...coachForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeSubTab === "pembina" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap Pembina</label>
                      <input
                        type="text"
                        required
                        value={supervisorForm.nama}
                        onChange={(e) => setSupervisorForm({ ...supervisorForm, nama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Jabatan Guru / Staff</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Wakasek Kesiswaan"
                        value={supervisorForm.jabatan}
                        onChange={(e) => setSupervisorForm({ ...supervisorForm, jabatan: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">No Kontak</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., +6281355"
                        value={supervisorForm.kontak}
                        onChange={(e) => setSupervisorForm({ ...supervisorForm, kontak: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Ekskul Binaan</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {database.extracurriculars.map((eks) => (
                          <label key={eks.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={supervisorForm.ekskulBinaan?.includes(eks.nama)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const current = supervisorForm.ekskulBinaan || [];
                                if (checked) {
                                  setSupervisorForm({ ...supervisorForm, ekskulBinaan: [...current, eks.nama] });
                                } else {
                                  setSupervisorForm({ ...supervisorForm, ekskulBinaan: current.filter(n => n !== eks.nama) });
                                }
                              }}
                              className="rounded text-maroon-500 accent-maroon-500"
                            />
                            <span className="truncate">{eks.nama}</span>
                          </label>
                        ))}
                        {database.extracurriculars.length === 0 && (
                          <div className="col-span-full text-center text-gray-400 italic text-xs py-2">
                            Belum ada data ekstrakurikuler.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSubTab === "akun" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pemegang Akun (Nama Lengkap)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ust. Ahmad Fauzi"
                        value={userForm.nama}
                        onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pengguna (Username)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: ahmadfauzi"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Kata Sandi Portal</label>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan sandi unik"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Peran Otoritas (Role)</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      >
                        <option value="Koordinator Ekstrakurikuler">Admin / Koordinator (Akses Penuh)</option>
                        <option value="Kepala Sekolah">Kepala Sekolah (Monitoring Saja)</option>
                        <option value="Pelatih">Pelatih (Penilaian, Presensi, Dokumentasi)</option>
                        <option value="Pembina Ekstrakurikuler">Pembina Ekstrakurikuler (Presensi & Evaluasi)</option>
                        <option value="Siswa">Siswa (Pendaftaran & Presensi Mandiri)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">ID Entitas Terkait (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Contoh: pelatih-1 atau siswa-1"
                        value={userForm.linkedEntityId}
                        onChange={(e) => setUserForm({ ...userForm, linkedEntityId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Gunakan ini untuk menghubungkan akun ke ID Pelatih/Pembina/Siswa di Master Data agar biodata sinkron.</p>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForms();
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-surface-sunken rounded-xl text-xs text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalEkskul && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-display font-bold text-lg text-gray-800">
                Informasi Ekstrakurikuler
              </h3>
              <button
                onClick={() => setDetailModalEkskul(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(() => {
                const eks = database.extracurriculars.find((e) => e.id === detailModalEkskul);
                const students = database.students.filter((s) => s.ekskulIds.includes(detailModalEkskul));
                if (!eks) return null;

                const pelatih = database.coaches.find((c) => c.id === eks.pelatihId);
                const pembina = database.supervisors.find((p) => p.id === eks.pembinaId);

                return (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-maroon-50 flex items-center justify-center text-maroon-600 shadow-inner">
                        <Target size={32} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-gold-600 uppercase tracking-widest">{eks.kategori}</span>
                        <h4 className="text-xl font-display font-bold text-gray-800">{eks.nama}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1"><Clock size={12}/> {eks.hari}, {eks.jam}</span>
                          <span className="flex items-center gap-1"><MapPin size={12}/> {eks.tempat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pelatih Utama</p>
                        <p className="text-sm font-semibold text-gray-800">{pelatih?.nama || "-"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pembina</p>
                        <p className="text-sm font-semibold text-gray-800">{pembina?.nama || "-"}</p>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-gray-800 text-sm">Daftar Santri Terdaftar ({students.length})</h5>
                        <button
                          onClick={() => {
                            const csvRows = [
                              ["No", "Nama Siswa", "Kelas", "Asrama"],
                              ...students.map((s, idx) => [
                                idx + 1,
                                `"${s.nama}"`,
                                `"${s.kelas}"`,
                                `"${s.asrama}"`
                              ])
                            ];
                            const csvContent = csvRows.map(row => row.join(",")).join("\n");
                            const blob = new Blob([csvContent], { type: "text/csv" });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", "Data_Siswa.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => {
                              window.URL.revokeObjectURL(url);
                            }, 100);
                          }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Download size={12} />
                          Ekspor CSV
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-2.5 px-4 font-bold text-gray-500 w-12 text-center">No</th>
                              <th className="py-2.5 px-4 font-bold text-gray-500">Nama Siswa</th>
                              <th className="py-2.5 px-4 font-bold text-gray-500 w-24">Kelas</th>
                              <th className="py-2.5 px-4 font-bold text-gray-500">Asrama</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {students.length > 0 ? (
                              students.map((s, idx) => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-2.5 px-4 text-gray-500 text-center font-mono">{idx + 1}</td>
                                  <td className="py-2.5 px-4 font-medium text-gray-800">{s.nama}</td>
                                  <td className="py-2.5 px-4 text-gray-600 font-mono">{s.kelas}</td>
                                  <td className="py-2.5 px-4 text-gray-600">{s.asrama}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                                  Belum ada siswa yang mendaftar di ekstrakurikuler ini.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.action === "delete"}
        confirmText={confirmModal.action === "delete" ? "Ya, Hapus" : "Ya, Simpan"}
        onConfirm={confirmModal.action === "delete" ? executeDelete : executeSave}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
