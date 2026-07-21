import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Info,
  ShieldAlert,
  Search,
  CheckCircle,
  Cpu,
  Database,
  BrainCircuit,
  X,
  Zap,
  Filter
} from "lucide-react";
import { AppDatabase, AuditLog, Role } from "../types";

interface MonitoringViewProps {
  database: AppDatabase;
  setDatabase: (db: AppDatabase) => void;
  currentRole: Role;
}

export default function MonitoringView({ database, setDatabase, currentRole }: MonitoringViewProps) {
  const [filterLevel, setFilterLevel] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI Risk Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);

  const getSystemLogs = (): Array<{ id: string; tanggal: string; user: string; level: "INFO" | "WARN" | "ERROR"; kategori: string; detail: string }> => {
    // Combine audit logs and generate some simulated telemetry logs
    const base = database.auditLogs.map((log) => ({
      id: log.id,
      tanggal: log.tanggal,
      user: log.user,
      level: "INFO" as any,
      kategori: "Audit Admin",
      detail: `${log.aktivitas}: ${log.detail}`
    }));

    // Seed some warning/error telemetries
    return base;
  };

  const allLogs = getSystemLogs();

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setAiReport(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiReport({
        score: "88/100",
        status: "Sangat Sehat",
        risks: [
          {
            id: "r1",
            level: "Sedang",
            aspek: "Kebugaran Santri",
            deskripsi: "Terdapat indikasi kelelahan fisik pada ekskul Panahan dan Berkuda akibat jadwal latihan siang hari di tengah musim panas.",
            solusi: "Geser jam mulai latihan panahan dari 14:00 ke 16:00 WIB untuk mencegah risiko dehidrasi."
          },
          {
            id: "r2",
            level: "Tinggi",
            aspek: "Absensi Santri",
            deskripsi: "Ahmad Rayhan (X-B) menunjukkan tren penurunan motivasi kehadiran pada ekskul Robotik (Alpa 2x berturut-turut).",
            solusi: "Minta Wali Kelas / Pembina melakukan konseling asrama untuk mengetahui kendala santri."
          },
          {
            id: "r3",
            level: "Rendah",
            aspek: "Logistik Sarana",
            deskripsi: "Kuota alat panah berkurang karena 3 busur rusak di pekan ini.",
            solusi: "Segera lakukan repair & re-stok sarana olahraga untuk menghindari rebutan alat."
          }
        ],
        rekomendasi: "Jadwalkan rapat evaluasi pembina bersama pelatih di hari Ahad pekan ini untuk mematangkan SOP keselamatan berkuda."
      });
    }, 2200);
  };

  const getFilteredLogs = () => {
    const q = searchQuery.toLowerCase();
    return allLogs.filter((log) => {
      const matchSearch =
        log.user.toLowerCase().includes(q) ||
        log.kategori.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q);
      
      if (filterLevel === "ALL") return matchSearch;
      return log.level === filterLevel && matchSearch;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
            Pusat Monitoring & Audit Log Realtime
          </h2>
          <p className="text-xs text-gray-400">Pemantauan aktivitas operasional sekolah, logs kesiswaan, dan analisis risiko AI</p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-500/10 text-maroon-500 flex items-center justify-center shrink-0">
            <Cpu size={18} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Server Status</span>
            <span className="text-sm font-display font-bold text-gray-800">ONLINE (Healthy)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-500/10 text-maroon-500 flex items-center justify-center shrink-0">
            <Database size={18} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">DB Sync Integrity</span>
            <span className="text-sm font-display font-bold text-gray-800">100% Synced</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">SMS / WA Gateway</span>
            <span className="text-sm font-display font-bold text-gray-800">Active Queue: 0</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-500/10 text-navy-500 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Rata-rata Respon</span>
            <span className="text-sm font-display font-bold text-gray-800">14 ms (Sangat Cepat)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Realtime logs ledger (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-4 bg-surface-sunken border-b border-border flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display font-bold text-xs text-gray-800">
              Umpan Log Logistik & Keamanan Sekolah
            </h3>

            {/* Level Selector buttons */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setFilterLevel("ALL")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  filterLevel === "ALL" ? "bg-white text-gray-800 shadow-xs" : "text-gray-400"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterLevel("INFO")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  filterLevel === "INFO" ? "bg-white text-maroon-500 shadow-xs" : "text-gray-400"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setFilterLevel("WARN")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  filterLevel === "WARN" ? "bg-white text-gold-500 shadow-xs" : "text-gray-400"
                }`}
              >
                Warn
              </button>
              <button
                onClick={() => setFilterLevel("ERROR")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  filterLevel === "ERROR" ? "bg-white text-navy-500 shadow-xs" : "text-gray-400"
                }`}
              >
                Critical
              </button>
            </div>
          </div>

          {/* Search box within logs */}
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari logs berdasarkan user, kategori, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs rounded-lg bg-surface-sunken border border-border outline-none placeholder-gray-400 text-gray-800"
              />
            </div>
          </div>

          {/* Table list of logs */}
          <div className="divide-y divide-gray-50 max-h-128 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-surface-sunken/40 transition-colors flex gap-3 items-start">
                <div className="shrink-0 mt-0.5">
                  {log.level === "INFO" && <Info size={14} className="text-maroon-400" />}
                  {log.level === "WARN" && <AlertTriangle size={14} className="text-gold-500" />}
                  {log.level === "ERROR" && <ShieldAlert size={14} className="text-navy-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gray-400">{log.tanggal}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 font-semibold text-gray-500 uppercase tracking-wider">
                      {log.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {log.detail}
                  </p>
                  <span className="text-[9px] text-gray-400 mt-1 block font-mono">Operator: {log.user}</span>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">
                Tidak ada log aktivitas yang cocok dengan kriteria filter.
              </div>
            )}
          </div>
        </div>

        {/* AI-Based Risk Analysis (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-6 border border-emerald-500/20 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="text-maroon-500" size={24} />
              <div>
                <h3 className="font-display font-bold text-sm tracking-wide text-white">
                  Gemini AI Risk Guard
                </h3>
                <span className="text-[9px] font-mono tracking-widest text-maroon-500 font-bold uppercase">
                  Analisis Keselamatan & Kelalaian Santri
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              Teknologi AI Studio memindai database absensi, jadwal kegiatan, dan log pemakaian alat untuk memberikan rekomendasi pencegahan dini terhadap cedera olahraga, kelalaian santri, dan kebosanan minat.
            </p>

            {/* Simulated Analysis Area */}
            {isAnalyzing ? (
              <div className="bg-black/30 border border-emerald-500/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold font-mono text-maroon-500 uppercase tracking-widest">
                    Menganalisis Pola Absen Santri...
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-maroon-500/10 rounded animate-pulse" />
                  <div className="h-2 w-5/6 bg-maroon-500/10 rounded animate-pulse" />
                  <div className="h-2 w-1/2 bg-maroon-500/10 rounded animate-pulse" />
                </div>
              </div>
            ) : aiReport ? (
              <div className="bg-black/30 border border-emerald-500/20 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-maroon-500">STATUS KEAMANAN EKSKUL</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-maroon-500/20 text-green-400 border border-maroon-400/30 font-bold">
                    {aiReport.status} ({aiReport.score})
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {aiReport.risks.map((r: any) => (
                    <div key={r.id} className="text-xs space-y-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-gold-400">{r.aspek}</strong>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          r.level === "Tinggi" ? "bg-navy-500/20 text-red-400" : r.level === "Sedang" ? "bg-gold-500/20 text-gold-400" : "bg-maroon-500/20 text-blue-400"
                        }`}>
                          Risk {r.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">{r.deskripsi}</p>
                      <p className="text-[10px] text-maroon-500 font-medium">Tindakan: {r.solusi}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-maroon-500/10 border border-emerald-500/30 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-300">REKOMENDASI UMUM:</p>
                  <p className="text-[10px] text-gray-200 mt-1 leading-relaxed">{aiReport.rekomendasi}</p>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 border border-white/5 p-8 rounded-2xl text-center text-xs text-gray-400">
                Klik tombol di bawah untuk memindai status keselamatan ekskul pesantren.
              </div>
            )}
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="w-full py-2.5 bg-maroon-500 hover:bg-maroon-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
          >
            <BrainCircuit size={15} />
            <span>{isAnalyzing ? "Memproses Data..." : "Jalankan Analisis Risiko AI"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
