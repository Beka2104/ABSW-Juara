export type Role =
  | "Super Admin"
  | "Kepala Sekolah"
  | "Koordinator Ekstrakurikuler"
  | "Pembina Ekstrakurikuler"
  | "Pelatih"
  | "Wali Kelas"
  | "Siswa"
  | "Orang Tua";

export interface Extracurricular {
  id: string;
  nama: string;
  kategori: "Olahraga" | "Sains & Teknologi" | "Seni & Budaya" | "Keagamaan" | "Akademik";
  hari: string; // e.g. "Senin", "Sabtu"
  jam: string; // e.g. "16:00 - 17:30"
  tempat: string;
  pelatihId: string;
  pembinaId: string;
  kuota: number;
  status: "Aktif" | "Nonaktif";
  deskripsi: string;
  logo: string; // Icon or Image URL
  galeri: string[]; // List of Image URLs/Artifacts
}

export interface Student {
  id: string;
  nama: string;
  kelas: string; // e.g., "X-A IPA", "XI-C IPS"
  asrama: string; // e.g., "Gedung Shalahuddin Al-Ayyubi Kamar 4", "Gedung Aisyah Kamar 2"
  noHpOrtu: string;
  ekskulIds: string[];
  riwayat: {
    tanggal: string;
    kegiatan: string;
    keterangan: string;
  }[];
}

export interface Coach {
  id: string;
  nama: string;
  keahlian: string;
  noHp: string;
  email: string;
  honor: number; // coaching fee per meeting
  status: "Aktif" | "Nonaktif";
  riwayatMengajar: {
    tahun: string;
    ekskul: string;
    prestasi?: string;
  }[];
}

export interface Supervisor {
  id: string;
  nama: string;
  jabatan: string; // e.g., "Guru PAI", "Wakasek Kesiswaan"
  kontak: string;
  ekskulBinaan: string[]; // Names or IDs of extracurriculars
}

export interface SopChangeHistory {
  id: string;
  tanggal: string;
  versi: string;
  diubahOleh: string;
  deskripsi: string;
}

export interface Sop {
  id: string;
  judul: string;
  kategori:
    | "SOP Pelatih"
    | "SOP Pembina"
    | "SOP Peserta"
    | "SOP Perlombaan"
    | "SOP Perizinan"
    | "SOP Presensi"
    | "SOP Keselamatan"
    | "SOP Penggunaan Sarana";
  konten: string; // Markdown text or HTML
  versi: string;
  riwayatPerubahan: SopChangeHistory[];
  fileUrl?: string;
  fileName?: string;
}

export interface ScheduleEvent {
  id: string;
  judul: string;
  ekskulId: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  tempat: string;
  tipe: "Latihan Rutin" | "Ujian Kenaikan Tingkat" | "Rapat Koordinasi" | "Perlombaan" | "Pameran/Demo";
  keterangan: string;
  color?: string; // Hex color or class
}

export interface PresensiRecord {
  id: string;
  ekskulId: string;
  tanggal: string; // YYYY-MM-DD
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  asrama: string;
  waktuMasuk: string; // HH:MM
  waktuPulang?: string; // HH:MM
  status: "Hadir" | "Izin" | "Sakit" | "Alpa" | "Terlambat";
  metode: "QR Code" | "PIN" | "Manual" | "GPS" | "Foto Selfie";
  fotoSelfie?: string; // base64 or placeholder image name
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    distanceFromSchool: number; // in meters
  };
}

export interface Competition {
  id: string;
  namaLomba?: string;
  nama?: string;
  penyelenggara?: string;
  lokasi?: string;
  tempat?: string;
  tanggal?: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  biaya?: number;
  anggaran?: number;
  status?: string;
  persyaratan?: string[];
  pesertaIds?: string[]; // Student IDs
  ekskulId?: string;
  target?: string;
  prestasi?: any;
  dokumentasi?: string[]; // Photo URLs
  peserta?: string[];
  pendamping?: string;
}

export interface CoachAssessment {
  id: string;
  pelatihId: string;
  namaPelatih: string;
  ekskulId: string;
  tanggal: string; // YYYY-MM-DD
  // 12 Indicators (1 - 100)
  disiplin: number;
  kehadiran: number;
  ketepatanWaktu: number;
  kualitasLatihan: number;
  komunikasi: number;
  pengelolaanPeserta: number;
  administrasi: number;
  pencapaianTarget: number;
  prestasi: number;
  inovasi: number;
  kerjaSama: number;
  sikap: number;
  skorRata: number; // calculated auto
  rekomendasi: string;
}

export interface PeriodicEvaluation {
  id: string;
  tipe: "Mingguan" | "Bulanan" | "Semester" | "Tahunan";
  tanggal: string; // YYYY-MM-DD
  catatan: string;
  target: string;
  rekomendasi: string;
  tindakLanjut: string;
  lampiran?: string; // file name or URL
  ekskulId: string; // Associated extracurricular
}

export interface TaskItem {
  id: string;
  tugas: string;
  ditugaskanKepada: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  status: "Belum Dimulai" | "Sedang Dikerjakan" | "Selesai";
}

export interface Meeting {
  id: string;
  agenda: string;
  tanggal: string; // YYYY-MM-DD
  waktu?: string;
  tempat?: string;
  pimpinanRapat?: string;
  pesertaHadir?: string[];
  undangan?: string[]; // List of names or roles
  presensiList?: {
    nama: string;
    peran: string;
    hadir: boolean;
  }[];
  notulen?: string;
  notulensi?: string;
  dokumentasiUrl?: string;
  hasilRapat?: string;
  tugas?: TaskItem[];
}

export interface CentralDocument {
  id: string;
  nama: string;
  tipe: "SOP" | "SK" | "Surat" | "Proposal" | "LPJ" | "Sertifikat" | "Lainnya";
  kategori: string; // Associated extracurricular or "Umum"
  deskripsi: string;
  fileUrl: string;
  tanggalUpload: string; // YYYY-MM-DD
}

export interface SystemNotification {
  id: string;
  tipe: "Dashboard" | "Email" | "WhatsApp" | "Push Notification";
  pesan: string;
  tanggal: string; // YYYY-MM-DD HH:MM
  dibaca: boolean;
  pengirim: string;
}

export interface AuditLog {
  id: string;
  tanggal: string; // YYYY-MM-DD HH:MM:SS
  user: string;
  peran: string;
  aktivitas: string;
  detail: string;
}

export interface Assessment {
  id: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  ekskulId: string;
  kehadiran: number;
  keaktifan: number;
  keterampilan: number;
  sikap: number;
  nilaiAkhir: number;
  predikat: string;
}

export interface Evaluation {
  id: string;
  pemberiEvaluasi: string;
  peranPemberi: string;
  targetEvaluasiId: string;
  targetNama: string;
  skorKinerja: number;
  saranKritik: string;
}

export interface DocumentRecord {
  id: string;
  judul: string;
  kategori: "Surat Perizinan" | "Sertifikat" | "Persyaratan Lomba" | "Biodata Siswa";
  ekskulId: string;
  tanggalDibuat: string;
  status: "Pending" | "Disetujui" | "Ditolak" | "Direvisi";
  pengaju: string;
  fileUrl: string;
  tandaTanganDigital?: string;
  siswaId?: string;
  namaSiswa?: string;
  deskripsi?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: Role;
  linkedEntityId?: string; // id of student, coach, etc. if applicable
  profilePicture?: string; // URL to the custom profile picture
}

export interface AppDatabase {
  extracurriculars: Extracurricular[];
  students: Student[];
  coaches: Coach[];
  supervisors: Supervisor[];
  sops: Sop[];
  schedules: ScheduleEvent[];
  attendance: PresensiRecord[];
  competitions: Competition[];
  assessments: any[];
  evaluations: any[];
  meetings: Meeting[];
  documents: any[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  users?: UserAccount[]; // Optional to support backward compatibility
}
