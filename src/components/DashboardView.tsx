import { Users, Trophy, Activity, CalendarDays, TrendingUp, CheckCircle, Clock, Megaphone, UserCheck, Plus, BookOpen, ArrowRight, Landmark, Sparkles, User } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { AppDatabase, Role } from "../types";

interface DashboardViewProps {
  database: AppDatabase;
  setCurrentTab: (tab: string) => void;
  currentRole: Role;
  setDatabase: (db: AppDatabase) => void;
  onQuickAction: (actionType: string) => void;
  currentStudentName?: string;
}

export default function DashboardView({
  database,
  setCurrentTab,
  currentRole,
  setDatabase,
  onQuickAction,
  currentStudentName
}: DashboardViewProps) {
  const totalEkskul = database.extracurriculars.length;
  const totalSiswa = database.students.length;
  const totalPelatih = database.coaches.length;
  const totalPembina = database.supervisors.length;
  const totalLomba = database.competitions.length;

  const totalAttendanceRecords = database.attendance.length;
  const presentRecords = database.attendance.filter(
    (a) => a.status === "Hadir" || a.status === "Terlambat"
  ).length;
  const averageAttendance = totalAttendanceRecords
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 85;

  const chartDataAttendance = [
    { name: "Jan", persentase: 82, target: 85 },
    { name: "Feb", persentase: 86, target: 85 },
    { name: "Mar", persentase: 84, target: 85 },
    { name: "Apr", persentase: 89, target: 85 },
    { name: "Mei", persentase: 91, target: 85 },
    { name: "Jun", persentase: averageAttendance, target: 85 }
  ];

  const chartDataParticipation = database.extracurriculars.map((e) => {
    const studentCount = database.students.filter((s) => s.ekskulIds.includes(e.id)).length;
    return { name: e.nama.split(" ")[0], pendaftaran: studentCount || 5 };
  });

  const COLORS = ["#1E3A5F", "#C59324", "#059669", "#7C3AED", "#EC4899", "#14B8A6"];

  const stats = [
    { label: "Total Ekskul", value: totalEkskul, icon: Activity, color: "text-maroon-500", bg: "bg-maroon-50" },
    { label: "Siswa Aktif", value: totalSiswa, icon: Users, color: "text-maroon-500", bg: "bg-maroon-50" },
    { label: "Pelatih", value: totalPelatih, icon: Users, color: "text-gold-600", bg: "bg-gold-50" },
    { label: "Pembina", value: totalPembina, icon: Users, color: "text-navy-500", bg: "bg-navy-50" },
    { label: "Lomba Aktif", value: totalLomba, icon: Trophy, color: "text-navy-500", bg: "bg-navy-50" },
    { label: "Kehadiran", value: `${averageAttendance}%`, icon: CheckCircle, color: "text-maroon-500", bg: "bg-maroon-50" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-500 via-maroon-600 to-maroon-700 p-6 sm:p-8 text-white">
        {/* Decorative */}
        <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none translate-y-8 translate-x-8">
          <Landmark className="text-navy-500 opacity-20 w-48 h-48" />
        </div>
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold-400 text-[10px] font-semibold uppercase tracking-widest border border-white/10">
            {currentRole === "Siswa" ? "PORTAL SISWA AKTIF" : "ABSW JUARA DIGITAL SYSTEM"}
          </span>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-4 text-white leading-tight">
            ABSW Juara — SMAIT As-Syifa
          </h2>

          {currentRole === "Siswa" ? (
            <div className="text-white/60 text-sm mt-2 space-y-1">
              <p>Selamat datang, ananda <strong className="text-white/90">{currentStudentName || "Santri Baru"}</strong>!</p>
              <p className="text-xs text-white/40">
                Semangat berlatih dan raih prestasi di SMAIT As-Syifa Boarding School Wanareja.
              </p>
            </div>
          ) : (
            <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-lg">
              Selamat datang, <strong className="text-white/90">{currentStudentName || "Pengguna"}</strong> sebagai {currentRole}.
              Kelola seluruh ekosistem ekstrakurikuler dalam satu sistem terintegrasi.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {currentRole === "Siswa" ? (
              <>
                <button onClick={() => setCurrentTab("presensi")} className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                  <UserCheck size={14} /> Check-In GPS
                </button>
                <button onClick={() => setCurrentTab("jadwal")} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer">
                  <CalendarDays size={14} /> Lihat Jadwal
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentTab("presensi")} className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                  <UserCheck size={14} /> Presensi Ekskul
                </button>
                <button onClick={() => setCurrentTab("penilaian")} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer">
                  <Plus size={14} /> Input Penilaian
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium truncate">{s.label}</p>
                <h3 className="text-xl font-bold text-slate-800 font-display mt-0.5">{s.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Charts (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Attendance Chart */}
          <div className="bg-white border border-border p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800">Grafik Kehadiran Santri</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tren bulanan vs target sekolah (85%)</p>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-maroon-50 text-maroon-500 px-2 py-1 rounded-lg border border-maroon-100">
                LIVE
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataAttendance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8ecf1", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="persentase" name="Kehadiran (%)" stroke="#1E3A5F" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#C59324" strokeWidth={1.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Bar Chart */}
          <div className="bg-white border border-border p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800">Distribusi Santri per Ekskul</h3>
                <p className="text-xs text-slate-400 mt-0.5">Jumlah santri terdaftar di masing-masing program</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataParticipation} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8ecf1", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} />
                  <Bar dataKey="pendaftaran" name="Santri Terdaftar" radius={[6, 6, 0, 0]}>
                    {chartDataParticipation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Insights */}
          <div className="bg-maroon-500 text-white rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-6 h-6 bg-gold-500 rounded flex items-center justify-center text-white"><Sparkles size={14} /></div>
              <h4 className="text-xs font-bold tracking-wide uppercase font-display text-gold-400">AI Insights</h4>
            </div>
            <p className="text-xs leading-relaxed text-white/70 relative z-10">
              Ekskul <span className="text-gold-400 font-semibold">Panahan & Berkuda</span> mengalami peningkatan kehadiran 12% minggu ini. Rekomendasi: apresiasi pembina & pelatih.
            </p>
            <button
              onClick={() => setCurrentTab("monitoring")}
              className="mt-4 text-[10px] font-semibold flex items-center gap-1 text-gold-400 hover:text-gold-300 relative z-10 cursor-pointer bg-transparent border-none p-0 transition-colors"
            >
              Analisis Lengkap <ArrowRight size={11} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-border p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { action: "take-attendance", icon: UserCheck, label: "Absensi Baru" },
                { action: "new-assessment", icon: Plus, label: "Nilai Santri" },
                { action: "sop-rev", icon: BookOpen, label: "Revisi SOP" },
                { action: "new-competition", icon: Trophy, label: "Lomba Baru" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.action}
                    onClick={() => onQuickAction(item.action)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-sunken hover:bg-maroon-50 border border-border hover:border-maroon-100 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center mb-2 text-maroon-500 group-hover:scale-105 transition-transform shadow-sm">
                      <Icon size={15} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Agenda */}
          <div className="bg-white border border-border p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Agenda Pekan Ini</h3>
            <div className="space-y-3">
              {database.schedules.slice(0, 3).map((sch) => (
                <div key={sch.id} className="p-3 rounded-xl border border-border flex items-start gap-3 hover:bg-surface-sunken transition-colors">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: sch.color || "#1E3A5F" }} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">{sch.judul}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                      <Clock size={10} />
                      {sch.tanggal} • {sch.jamMulai}–{sch.jamSelesai}
                    </p>
                    <p className="text-[10px] text-maroon-500 mt-1 truncate font-medium">{sch.tempat}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentTab("jadwal")}
              className="w-full text-center py-2.5 mt-3 text-xs text-maroon-500 font-semibold hover:underline bg-maroon-50 rounded-xl cursor-pointer transition-colors"
            >
              Lihat Seluruh Kalender
            </button>
          </div>

          {/* Announcements */}
          <></>
        </div>
      </div>
    </div>
  );
}
