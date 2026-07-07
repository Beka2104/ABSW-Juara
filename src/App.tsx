import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, Shield, Clock, Loader, RotateCcw, Landmark, Monitor } from "lucide-react";

import { AppDatabase, Role, Student } from "./types";
import { initialDatabase } from "./data";

// Component imports
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import MasterDataView from "./components/MasterDataView";
import SopView from "./components/SopView";
import JadwalView from "./components/JadwalView";
import PresensiView from "./components/PresensiView";
import MonitoringView from "./components/MonitoringView";
import CompetitionsView from "./components/CompetitionsView";
import AssessmentsView from "./components/AssessmentsView";
import MeetingsView from "./components/MeetingsView";
import DocumentsView from "./components/DocumentsView";
import LoginView from "./components/LoginView";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function App() {
  const [database, setDatabase] = useState<AppDatabase | null>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Koordinator Ekstrakurikuler");
  const [isLoading, setIsLoading] = useState(true);

  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | undefined>(undefined);
  const [currentStudentName, setCurrentStudentName] = useState<string | undefined>(undefined);
  const [currentUserProfilePic, setCurrentUserProfilePic] = useState<string | undefined>(undefined);

  // Mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Chatbot
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Assalamualaikum! Saya adalah ABSW Juara AI Assistant. Bagaimana saya bisa membantu Anda dalam mengelola program ekstrakurikuler hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch Database
  const fetchDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Gagal mengambil data.");
      const data: AppDatabase = await res.json();

      if (!data.extracurriculars || data.extracurriculars.length === 0) {
        await saveDatabase(initialDatabase);
        setDatabase(initialDatabase);
      } else {
        const finalDb = {
          ...data,
          users: data.users && data.users.length > 0 ? data.users : initialDatabase.users
        };
        setDatabase(finalDb);
        if (!data.users || data.users.length === 0) {
          saveDatabase(finalDb);
        }
      }
    } catch (err) {
      console.error("Failed to load DB, using fallback", err);
      setDatabase(initialDatabase);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDatabase = async (updatedDb: AppDatabase) => {
    setDatabase(updatedDb);
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDb)
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
    } catch (err) {
      console.error("Backend write failed:", err);
    }
  };

  useEffect(() => { fetchDatabase(); }, []);
  useEffect(() => { document.documentElement.classList.remove("dark"); }, []);
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAssistantOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || !database) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend, dbState: database })
      });

      const data = await res.json();

      if (res.status === 400 && data.error === "GEMINI_API_KEY_MISSING") {
        setChatMessages((prev) => [...prev, {
          sender: "ai", text: data.message,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }]);
      } else if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI.");
      } else {
        setChatMessages((prev) => [...prev, {
          sender: "ai", text: data.reply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [...prev, {
        sender: "ai",
        text: `Maaf, terjadi kesalahan: ${err.message}`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
    const map: Record<string, string> = {
      "take-attendance": "presensi",
      "new-assessment": "penilaian",
      "sop-rev": "sop",
      "new-competition": "perlombaan"
    };
    if (map[actionType]) setCurrentTab(map[actionType]);
  };

  const handleSearchSelect = (tab: string, item: any) => {
    setCurrentTab(tab);
    alert(`Membuka: ${item.title || item.judul || "Detail"}`);
  };

  const handleFactoryReset = async () => {
    if (window.confirm("Yakin ingin menyetel ulang database ke kondisi bawaan?")) {
      await saveDatabase(initialDatabase);
      alert("Database berhasil disetel ulang!");
    }
  };

  const handleLogin = (role: Role, studentId?: string, studentName?: string) => {
    setCurrentRole(role);
    setCurrentStudentId(studentId);
    setCurrentStudentName(studentName);
    
    if (database && database.users) {
      const user = database.users.find(u => u.linkedEntityId === studentId || (studentId && u.id === studentId) || (u.role === role && role.includes("Admin")));
      if (user && user.profilePicture) {
        setCurrentUserProfilePic(user.profilePicture);
      } else {
        setCurrentUserProfilePic(undefined);
      }
    } else {
      setCurrentUserProfilePic(undefined);
    }

    setIsLoggedIn(true);
    setChatMessages([{
      sender: "ai",
      text: `Assalamualaikum ${studentName || "Ustadz"}! Saya AI Assistant ABSW Juara. Apa yang bisa saya bantu hari ini?`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentStudentId(undefined);
    setCurrentStudentName(undefined);
    setCurrentUserProfilePic(undefined);
    setCurrentRole("Koordinator Ekstrakurikuler");
    setIsMobileSidebarOpen(false);
  };

  const handleRegister = (entityData: any, role: Role, password?: string) => {
    if (!database) return;
    const newUserAccount = {
      id: `user-${Date.now()}`,
      username: entityData.nama.toLowerCase().replace(/\s+/g, ""),
      password: password || (role === "Siswa" ? "siswa123" : role === "Pelatih" ? "pelatih123" : "pembina123"),
      nama: entityData.nama,
      role: role,
      linkedEntityId: entityData.id
    };
    
    const updatedDb: AppDatabase = { ...database };
    
    if (role === "Siswa") {
      updatedDb.students = [...updatedDb.students, entityData as Student];
    } else if (role === "Pelatih") {
      updatedDb.coaches = [...updatedDb.coaches, entityData as Coach];
    } else if (role === "Pembina Ekstrakurikuler") {
      updatedDb.supervisors = [...updatedDb.supervisors, entityData as Supervisor];
    }

    updatedDb.users = [...(updatedDb.users || []), newUserAccount];
    
    setDatabase(updatedDb);
    saveDatabase(updatedDb);
  };

  const renderTabContent = () => {
    if (!database) return null;
    switch (currentTab) {
      case "dashboard":
        return <DashboardView database={database} setDatabase={saveDatabase} setCurrentTab={setCurrentTab} currentRole={currentRole} onQuickAction={handleQuickAction} currentStudentName={currentStudentName} />;
      case "master":
        return <MasterDataView database={database} setDatabase={saveDatabase} currentRole={currentRole} currentStudentId={currentStudentId} />;
      case "sop":
        return <SopView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "jadwal":
        return <JadwalView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "presensi":
        return <PresensiView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "monitoring":
        return <MonitoringView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "perlombaan":
        return <CompetitionsView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "penilaian":
      case "evaluasi":
        return <AssessmentsView database={database} setDatabase={saveDatabase} currentRole={currentRole} initialTab="penilaian" />;
      case "rapat":
        return <MeetingsView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "dokumen":
        return <DocumentsView database={database} setDatabase={saveDatabase} currentRole={currentRole} />;
      case "laporan":
        return <AssessmentsView database={database} setDatabase={saveDatabase} currentRole={currentRole} initialTab="raport" />;
      default:
        return (
          <div className="p-12 text-center text-slate-400">
            Halaman ini sedang dalam pengembangan.
          </div>
        );
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bento-bg text-maroon-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="text-5xl"
        >
          <Landmark className="text-gold-500" size={24} />
        </motion.div>
        <p className="font-display font-bold text-xs tracking-widest uppercase mt-4 text-maroon-500 animate-pulse">
          Memuat Portal ABSW Juara...
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-1">SMAIT As-Syifa Boarding School Wanareja</p>
      </div>
    );
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <LoginView
        database={database || initialDatabase}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bento-bg font-sans text-slate-800">

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 block md:hidden transition-all"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentRole={currentRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAssistant={() => setIsAssistantOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          database={database || initialDatabase}
          onSearchSelect={handleSearchSelect}
          openAuditLogs={() => setShowAuditLogs(true)}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentStudentName={currentStudentName}
          currentUserId={currentStudentId}
          currentUserProfilePic={currentUserProfilePic}
          setCurrentUserProfilePic={setCurrentUserProfilePic}
          setDatabase={saveDatabase}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating AI Button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-maroon-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-40 group"
          title="AI Assistant"
        >
          <Sparkles className="text-gold-400" size={18} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-36 group-hover:ml-2 text-xs font-semibold tracking-wide transition-all duration-300">
            AI Assistant
          </span>
        </button>
      </div>

      {/* AI Assistant Drawer */}
      <AnimatePresence>
        {isAssistantOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="fixed inset-0 bg-black z-45"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-lg border-l border-border z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-maroon-500 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkles size={15} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[13px] tracking-wide text-gold-400">
                      AI Assistant
                    </h3>
                    <p className="text-[9px] text-white/50 font-mono">Gemini AI • Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssistantOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-sunken">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-maroon-500 text-white rounded-tr-md"
                          : "bg-white text-slate-700 border border-border rounded-tl-md shadow-sm whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                    <Loader size={12} className="animate-spin text-maroon-500" />
                    <span>Sedang memproses...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="p-3 border-t border-border bg-white space-y-2">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block px-1">
                  Pertanyaan Cepat
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { emoji: "📈", label: "Analisis Absensi", prompt: "Analisis tingkat kehadiran santri di seluruh ekstrakurikuler" },
                    { emoji: "", label: "Rekomendasi Lomba", prompt: "Berikan rekomendasi kejuaraan panahan yang bisa diikuti" },
                    { emoji: "", label: "Draf LPJ", prompt: "Susun draf laporan LPJ mingguan kesiswaan" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="px-2.5 py-1.5 bg-surface-sunken hover:bg-maroon-50 text-[10px] rounded-lg border border-border hover:border-maroon-100 transition-all font-medium text-left text-slate-600"
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik pertanyaan..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-surface-sunken border border-border focus:border-maroon-200 focus:outline-none focus:ring-2 focus:ring-maroon-500/10 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isAiLoading}
                  className="p-2.5 rounded-xl bg-maroon-500 hover:bg-maroon-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Audit Logs Modal */}
      <AnimatePresence>
        {showAuditLogs && database && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl shadow-lg border border-border overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface-sunken">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-maroon-500" />
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
                      Security & Audit Trails
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Riwayat seluruh mutasi data sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto p-5 text-xs">
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-sunken text-slate-400 font-mono text-[9px] uppercase tracking-wider font-semibold border-b border-border">
                        <th className="p-3">Tanggal & Jam</th>
                        <th className="p-3">Pengguna</th>
                        <th className="p-3">Aktivitas</th>
                        <th className="p-3">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-slate-600">
                      {database.auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-sunken transition-colors">
                          <td className="p-3 font-mono text-[10px] text-slate-400 shrink-0">{log.tanggal}</td>
                          <td className="p-3">
                            <span className="font-semibold block text-slate-800">{log.user}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">{log.peran}</span>
                          </td>
                          <td className="p-3 font-semibold text-maroon-500">{log.aktivitas}</td>
                          <td className="p-3 text-slate-500 italic">"{log.detail}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-surface-sunken border-t border-border flex items-center justify-between">
                <button
                  onClick={handleFactoryReset}
                  className="px-3.5 py-2 border border-navy-100 hover:bg-navy-50 text-navy-500 font-semibold text-[10px] rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw size={11} />
                  RESET DATABASE
                </button>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Clock size={10} />
                  <span>Enkripsi AES-256</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
