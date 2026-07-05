import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Calendar,
  CheckSquare,
  BarChart3,
  Trophy,
  Star,
  FolderLock,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { Role } from "../types";

interface SidebarProps {
  currentRole: Role;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAssistant?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const AsSyifaLogo = () => (
  <img src="/logo.png" alt="SMAIT As-Syifa Logo" className="w-10 h-10 object-contain select-none shrink-0" />
);

export default function Sidebar({
  currentRole,
  currentTab,
  setCurrentTab,
  openAssistant,
  isMobileOpen,
  onCloseMobile
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "master", label: "Master Data", icon: Database },
    { id: "sop", label: "SOP & Dokumen", icon: BookOpen },
    { id: "jadwal", label: "Jadwal", icon: Calendar },
    { id: "presensi", label: "Presensi Digital", icon: CheckSquare },
    { id: "monitoring", label: "Monitoring", icon: BarChart3 },
    { id: "perlombaan", label: "Kalender Lomba", icon: Trophy },
    { id: "penilaian", label: "Penilaian Santri", icon: Star },
    { id: "dokumen", label: "Pusat Dokumen", icon: FolderLock },
    { id: "laporan", label: "Laporan Cetak", icon: FileText }
  ];

  const menuItems = currentRole === "Siswa"
    ? allMenuItems.filter(item => ["dashboard", "master", "sop", "jadwal", "presensi", "perlombaan"].includes(item.id))
    : allMenuItems;

  const roleLabel = currentRole === "Koordinator Ekstrakurikuler" ? "Koordinator" : currentRole;

  return (
    <aside
      className={`fixed md:relative flex flex-col h-screen bg-white border-r border-border transition-all duration-300 ease-in-out z-45 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      } ${
        isMobileOpen
          ? "translate-x-0 shadow-2xl"
          : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center justify-between border-b border-border ${collapsed ? "px-3 py-4" : "px-5 py-4"}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <AsSyifaLogo />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[13px] leading-tight text-maroon-500 tracking-tight">
                ABSW JUARA
              </h1>
              <p className="text-[10px] text-gold-500 font-semibold tracking-wide mt-0.5">
                SMAIT As-Syifa
              </p>
              <div className="mt-1.5">
                <span className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-md bg-maroon-50 text-maroon-500 border border-maroon-100 truncate max-w-[140px]">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <AsSyifaLogo />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {/* Mobile Close */}
          <button
            onClick={onCloseMobile}
            className="flex md:hidden items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <X size={15} />
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-surface-sunken hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all border border-border"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && (
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Menu Utama
          </p>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                onCloseMobile?.();
              }}
              title={collapsed ? item.label : undefined}
              className={`flex items-center w-full gap-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
              } ${
                isActive
                  ? "bg-maroon-50 text-maroon-500 font-semibold border border-maroon-100"
                  : "text-slate-500 hover:bg-surface-sunken hover:text-slate-700 font-medium border border-transparent"
              }`}
            >
              <Icon
                size={collapsed ? 20 : 17}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="shrink-0 transition-all duration-150"
              />
              {!collapsed && (
                <span className="truncate text-[13px]">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — AI CTA & Version */}
      <div className={`border-t border-border ${collapsed ? "p-2" : "p-4"} space-y-3`}>
        {!collapsed ? (
          <button
            onClick={openAssistant}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-maroon-500 to-maroon-400 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-gold-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-bold tracking-wide">AI Assistant</p>
              <p className="text-[9px] text-white/60 font-medium">Tanya apapun</p>
            </div>
          </button>
        ) : (
          <button
            onClick={openAssistant}
            title="AI Assistant"
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-maroon-500 text-white cursor-pointer hover:bg-maroon-500 transition-colors"
          >
            <Sparkles size={16} className="text-gold-400" />
          </button>
        )}

        {!collapsed && (
          <p className="text-center text-[9px] text-slate-400 font-mono tracking-wider">
            ABSW JUARA v3.0
          </p>
        )}
      </div>
    </aside>
  );
}
