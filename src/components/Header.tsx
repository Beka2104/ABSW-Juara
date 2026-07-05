import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Bell, Shield, User, Clock, Menu, LogOut, ChevronDown, X, Upload } from "lucide-react";
import { AppDatabase, Role, SystemNotification } from "../types";

interface HeaderProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  database: AppDatabase;
  onSearchSelect: (tab: string, item: any) => void;
  openAuditLogs: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  currentStudentName?: string;
  currentUserId?: string;
  currentUserProfilePic?: string;
  setCurrentUserProfilePic?: (url: string) => void;
  setDatabase?: (db: AppDatabase) => void;
}

export default function Header({
  currentRole,
  setCurrentRole,
  database,
  onSearchSelect,
  openAuditLogs,
  onLogout,
  onToggleSidebar,
  currentStudentName,
  currentUserId,
  currentUserProfilePic,
  setCurrentUserProfilePic,
  setDatabase
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newProfilePicUrl, setNewProfilePicUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSaveProfilePic = () => {
    if (setCurrentUserProfilePic) {
      setCurrentUserProfilePic(newProfilePicUrl);
    }
    
    if (setDatabase && database && currentUserId) {
      const updatedDb = { ...database };
      const userIndex = (updatedDb.users || []).findIndex(u => u.linkedEntityId === currentUserId || u.id === currentUserId);
      if (userIndex >= 0 && updatedDb.users) {
        updatedDb.users[userIndex].profilePicture = newProfilePicUrl;
        setDatabase(updatedDb);
      } else {
        const adminIndex = (updatedDb.users || []).findIndex(u => u.role === currentRole && currentRole.includes("Admin"));
        if (adminIndex >= 0 && updatedDb.users) {
          updatedDb.users[adminIndex].profilePicture = newProfilePicUrl;
          setDatabase(updatedDb);
        }
      }
    }
    setShowProfileModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProfilePicUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const unreadCount = database.notifications.filter((n) => !n.dibaca).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { type: string; title: string; subtitle: string; tab: string; item: any }[] = [];

    database.extracurriculars.forEach((e) => {
      if (e.nama.toLowerCase().includes(query) || e.deskripsi.toLowerCase().includes(query)) {
        results.push({
          type: "Ekstrakurikuler",
          title: e.nama,
          subtitle: `${e.kategori} • ${e.hari} ${e.jam}`,
          tab: "master",
          item: { subTab: "ekskul", data: e }
        });
      }
    });

    database.students.forEach((s) => {
      if (s.nama.toLowerCase().includes(query) || s.asrama.toLowerCase().includes(query)) {
        results.push({
          type: "Siswa",
          title: s.nama,
          subtitle: `Kelas ${s.kelas} • ${s.asrama}`,
          tab: "master",
          item: { subTab: "siswa", data: s }
        });
      }
    });

    database.coaches.forEach((c) => {
      if (c.nama.toLowerCase().includes(query) || c.keahlian.toLowerCase().includes(query)) {
        results.push({
          type: "Pelatih",
          title: c.nama,
          subtitle: c.keahlian,
          tab: "master",
          item: { subTab: "pelatih", data: c }
        });
      }
    });

    database.sops.forEach((sop) => {
      if (sop.judul.toLowerCase().includes(query) || sop.konten.toLowerCase().includes(query)) {
        results.push({
          type: "SOP",
          title: sop.judul,
          subtitle: sop.kategori,
          tab: "sop",
          item: sop
        });
      }
    });

    return results.slice(0, 8);
  };

  const searchResults = getSearchResults();

  const getNotifBadge = (tipe: string) => {
    const styles: Record<string, string> = {
      "WhatsApp": "bg-maroon-50 text-maroon-500 border-maroon-100",
      "Email": "bg-maroon-50 text-maroon-500 border-maroon-100",
      "Push Notification": "bg-gold-50 text-gold-600 border-gold-100",
    };
    const labels: Record<string, string> = {
      "WhatsApp": "WA",
      "Email": "MAIL",
      "Push Notification": "PUSH",
    };
    const style = styles[tipe] || "bg-slate-50 text-slate-600 border-slate-100";
    const label = labels[tipe] || "SYS";
    return (
      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${style}`}>
        {label}
      </span>
    );
  };

  return (
    <header className="sticky top-0 right-0 left-0 h-[60px] bg-white/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between z-20 transition-colors">
      {/* Mobile Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="block md:hidden p-2 rounded-lg text-slate-400 hover:bg-surface-sunken hover:text-slate-600 transition-colors cursor-pointer shrink-0 mr-2"
        title="Buka Menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Cari ekskul, siswa, pelatih, SOP..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-surface-sunken border border-transparent focus:border-maroon-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-maroon-500/10 placeholder-slate-400 transition-all"
        />

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-12 left-0 w-full bg-white border border-border rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-border text-[10px] font-mono tracking-wider text-slate-400 font-semibold">
              HASIL PENCARIAN
            </div>
            {searchResults.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-400">
                Tidak ada hasil untuk "{searchQuery}"
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSearchSelect(result.tab, result.item);
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="flex flex-col w-full text-left p-3 rounded-xl hover:bg-surface-sunken transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-maroon-50 text-maroon-500 border border-maroon-100">
                        {result.type}
                      </span>
                      <span className="font-semibold text-sm text-slate-800 truncate">
                        {result.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 pl-0.5 truncate">
                      {result.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">

        {/* Audit Log */}
        {["Super Admin", "Kepala Sekolah", "Koordinator Ekstrakurikuler"].includes(currentRole) && (
          <button
            onClick={openAuditLogs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-slate-500 hover:bg-surface-sunken hover:text-maroon-500 border border-border transition-all"
            title="Audit Log"
          >
            <Shield size={13} />
            <span>Audit</span>
          </button>
        )}

        {/* Role Selector */}
        <div className={`relative flex items-center gap-1.5 bg-surface-sunken text-slate-600 border border-border px-2.5 py-1.5 rounded-xl ${!["Super Admin", "Koordinator Ekstrakurikuler"].includes(currentRole) ? "opacity-80" : ""}`}>
          <Shield size={13} className="text-gold-500 shrink-0" />
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as Role)}
            disabled={!["Super Admin", "Koordinator Ekstrakurikuler"].includes(currentRole)}
            className="text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer text-slate-700 pr-4 appearance-none disabled:cursor-not-allowed"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Kepala Sekolah">Kepala Sekolah</option>
            <option value="Koordinator Ekstrakurikuler">Koordinator</option>
            <option value="Pembina Ekstrakurikuler">Pembina</option>
            <option value="Pelatih">Pelatih</option>
            <option value="Wali Kelas">Wali Kelas</option>
            <option value="Siswa">Siswa</option>
            <option value="Orang Tua">Orang Tua</option>
          </select>
          {["Super Admin", "Koordinator Ekstrakurikuler"].includes(currentRole) && (
            <ChevronDown size={11} className="absolute right-2 text-slate-400 pointer-events-none" />
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-surface-sunken text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-maroon-500 text-white font-mono text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                  <Bell size={14} className="text-maroon-500" />
                  Notifikasi
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono bg-navy-50 text-navy-500 px-2 py-0.5 rounded-full font-bold border border-navy-100">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {database.notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  database.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-surface-sunken transition-colors ${
                        !notif.dibaca ? "bg-maroon-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {getNotifBadge(notif.tipe)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {notif.pesan}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-400">
                            <Clock size={10} />
                            <span>{notif.tanggal}</span>
                            <span>•</span>
                            <span>{notif.pengirim}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-surface-sunken border-t border-border text-center">
                <button
                  onClick={() => {
                    database.notifications.forEach((n) => (n.dibaca = true));
                    setShowNotifications(false);
                  }}
                  className="text-xs text-maroon-500 font-semibold hover:underline"
                >
                  Tandai Semua Dibaca
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border relative">
          <button 
            onClick={() => {
              setNewProfilePicUrl(currentUserProfilePic || "");
              setShowProfileModal(true);
            }}
            className="relative w-8 h-8 rounded-full bg-maroon-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 overflow-hidden hover:ring-2 hover:ring-maroon-300 transition-all cursor-pointer group"
            title="Ubah Foto Profil"
          >
            {currentUserProfilePic ? (
              <img src={currentUserProfilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              currentRole.slice(0, 2).toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <User size={14} className="text-white" />
            </div>
          </button>
          
          <div className="hidden sm:block text-left max-w-[110px]">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {currentStudentName || "Ust. Reza Firmansyah"}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Profile Settings Modal */}
        {showProfileModal && createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-sunken">
                <h3 className="font-display font-bold text-slate-800 text-sm">
                  Pengaturan Foto Profil
                </h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full bg-maroon-50 text-maroon-500 flex items-center justify-center font-bold text-3xl shadow-inner overflow-hidden border border-border">
                    {newProfilePicUrl ? (
                      <img src={newProfilePicUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "Invalid URL"; }} />
                    ) : (
                      currentRole.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-2.5 bg-surface-sunken hover:bg-slate-100 border border-border rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                    >
                      <Upload size={14} className="text-maroon-500" />
                      Pilih Foto dari Komputer
                    </button>
                    <p className="text-[10px] text-slate-400 text-center px-4">
                      Format didukung: JPG, PNG, WEBP (Max 2MB).
                    </p>
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                />
              </div>
              <div className="p-4 bg-surface-sunken border-t border-border flex justify-end gap-2">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfilePic}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Profil
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:bg-navy-50 hover:text-navy-500 rounded-xl transition-all cursor-pointer"
          title="Keluar"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
