var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var data_exports = {};
__export(data_exports, {
  initialDatabase: () => initialDatabase
});
module.exports = __toCommonJS(data_exports);
const initialDatabase = {
  extracurriculars: [
    {
      id: "ekskul-1",
      nama: "Panahan (Archery Club)",
      kategori: "Olahraga",
      hari: "Sabtu",
      jam: "08:00 - 10:00",
      tempat: "Lapangan Olahraga Utama (Outdoor)",
      pelatihId: "pelatih-1",
      pembinaId: "pembina-1",
      kuota: 30,
      status: "Aktif",
      deskripsi: "Ekskul Panahan melatih fokus, konsentrasi, disiplin, kekuatan fisik, dan menghidupkan sunnah Rasulullah SAW. Sangat diminati oleh santri SMAIT As-Syifa Wanareja.",
      logo: "\u{1F3AF}",
      galeri: [
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "ekskul-2",
      nama: "Robotics & IoT Club",
      kategori: "Sains & Teknologi",
      hari: "Kamis",
      jam: "16:00 - 17:30",
      tempat: "Laboratorium Komputer & STEM",
      pelatihId: "pelatih-2",
      pembinaId: "pembina-2",
      kuota: 20,
      status: "Aktif",
      deskripsi: "Mempelajari desain robotika, pemrograman sensor, mikrokontroler Arduino, Raspberry Pi, serta pembuatan proyek Internet of Things (IoT) guna menghadapi era revolusi industri 4.0.",
      logo: "\u{1F916}",
      galeri: [
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "ekskul-3",
      nama: "Pencak Silat (Tapak Suci)",
      kategori: "Olahraga",
      hari: "Senin",
      jam: "16:00 - 17:30",
      tempat: "Gedung Serba Guna (GSG) As-Syifa",
      pelatihId: "pelatih-3",
      pembinaId: "pembina-3",
      kuota: 40,
      status: "Aktif",
      deskripsi: "Seni bela diri warisan budaya bangsa yang mengedepankan pembentukan akhlak mulia, kekuatan fisik, pertahanan diri, serta ketakwaan kepada Allah SWT.",
      logo: "\u{1F94B}",
      galeri: [
        "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "ekskul-4",
      nama: "Hadroh & Nasyid El-Syifa",
      kategori: "Seni & Budaya",
      hari: "Jumat",
      jam: "20:00 - 21:30",
      tempat: "Masjid Al-Kautsar Wanareja",
      pelatihId: "pelatih-4",
      pembinaId: "pembina-1",
      kuota: 25,
      status: "Aktif",
      deskripsi: "Pengembangan seni musik Islami berupa lantunan shalawat hadroh kontemporer serta harmoni nasyid acapella untuk mensyiarkan nilai-nilai dakwah yang indah.",
      logo: "\u{1F941}",
      galeri: [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "ekskul-5",
      nama: "Tahfidz Al-Qur'an (Klub Takhassus)",
      kategori: "Keagamaan",
      hari: "Selasa",
      jam: "16:00 - 17:30",
      tempat: "Masjid Al-Kautsar Wanareja",
      pelatihId: "pelatih-5",
      pembinaId: "pembina-2",
      kuota: 50,
      status: "Aktif",
      deskripsi: "Program akselerasi hafalan Qur'an dengan metode talaqqi dan pendalaman makharijul huruf serta tajwid mutqin, khusus melahirkan santri Hafizh Al-Qur'an 30 Juz.",
      logo: "\u{1F4D6}",
      galeri: []
    }
  ],
  students: [
    {
      id: "siswa-1",
      nama: "Sahkan",
      kelas: "XI-A IPA",
      asrama: "Gedung Shalahuddin Al-Ayyubi Kamar 4",
      noHpOrtu: "+6281234567890",
      ekskulIds: ["ekskul-1", "ekskul-2"],
      riwayat: [
        { tanggal: "2026-05-10", kegiatan: "Latihan Panahan Mingguan", keterangan: "Meraih akurasi 90% pada jarak 20 meter." },
        { tanggal: "2026-06-15", kegiatan: "Robotic Exhibition", keterangan: "Merancang robot line-follower cerdas." }
      ]
    },
    {
      id: "siswa-2",
      nama: "Ahmad Rayhan Al-Ghifari",
      kelas: "XI-B IPA",
      asrama: "Gedung Shalahuddin Al-Ayyubi Kamar 6",
      noHpOrtu: "+6282245678901",
      ekskulIds: ["ekskul-1", "ekskul-3"],
      riwayat: [
        { tanggal: "2026-06-01", kegiatan: "Kenaikan Sabuk Tapak Suci", keterangan: "Lulus dengan predikat sangat baik (Sabuk Kuning Melati I)." }
      ]
    },
    {
      id: "siswa-3",
      nama: "Sahkan",
      kelas: "X-C IPA",
      asrama: "Gedung Muhammad Al-Fatih Kamar 2",
      noHpOrtu: "+6285356789012",
      ekskulIds: ["ekskul-3", "ekskul-4"],
      riwayat: [
        { tanggal: "2026-06-20", kegiatan: "Festival Shalawat Subang", keterangan: "Tampil sebagai vokalis utama hadroh." }
      ]
    },
    {
      id: "siswa-4",
      nama: "Dira",
      kelas: "XI-E IPA (Santriwati)",
      asrama: "Gedung Khadijah Kamar 3",
      noHpOrtu: "+6281167890123",
      ekskulIds: ["ekskul-1", "ekskul-5"],
      riwayat: [
        { tanggal: "2026-06-25", kegiatan: "Tasmi' 5 Juz Sekaligus", keterangan: "Lancar melantunkan Juz 1-5 dengan tajwid mutqin." }
      ]
    },
    {
      id: "siswa-5",
      nama: "Naila Syifa Azzahra",
      kelas: "X-F IPA (Santriwati)",
      asrama: "Gedung Aisyah Kamar 8",
      noHpOrtu: "+6281987654321",
      ekskulIds: ["ekskul-2", "ekskul-5"],
      riwayat: [
        { tanggal: "2026-05-20", kegiatan: "Perancangan IoT Pertanian", keterangan: "Membuat prototipe penyiram tanaman otomatis berbasis sensor tanah." }
      ]
    }
  ],
  coaches: [
    {
      id: "pelatih-1",
      nama: "Ustadz reza, S.Pd., C.Ar",
      keahlian: "Pelatih Panahan Lisensi Nasional (PERPANI)",
      noHp: "+6281312345678",
      email: "hardi.supriatna@assyifa.sch.id",
      honor: 15e5,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2023 - Sekarang", ekskul: "Panahan SMAIT As-Syifa Wanareja", prestasi: "Membina atlet juara 1 O2SN Kabupaten Subang" },
        { tahun: "2021 - 2023", ekskul: "Archery Club Subang", prestasi: "Juara Umum Kejurda Panahan Jabar" }
      ]
    },
    {
      id: "pelatih-2",
      nama: "Ir. Ahmad Sholahudin, M.T.",
      keahlian: "Dosen Robotika & Developer IoT",
      noHp: "+6282112345678",
      email: "ahmad.sholahudin@gmail.com",
      honor: 2e6,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2024 - Sekarang", ekskul: "Robotics SMAIT As-Syifa Wanareja", prestasi: "Finalis Kontes Robot Indonesia (KRI)" }
      ]
    },
    {
      id: "pelatih-3",
      nama: "Ustadz Yusuf Qardhawi, S.Or.",
      keahlian: "Pendekar Muda Tapak Suci Jabar",
      noHp: "+6285223456789",
      email: "yusuf.q@assyifa.sch.id",
      honor: 12e5,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2022 - Sekarang", ekskul: "Tapak Suci SMAIT As-Syifa", prestasi: "Meluluskan 15 pendekar sabuk kuning" }
      ]
    },
    {
      id: "pelatih-4",
      nama: "Ustadz Syarif Hidayatullah, S.Sn.",
      keahlian: "Seni Musik Islami & Olah Vokal",
      noHp: "+628114567890",
      email: "syarif.h@gmail.com",
      honor: 1e6,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2023 - Sekarang", ekskul: "Hadroh & Nasyid", prestasi: "Juara 2 Festival Nasyid Provinsi Jabar" }
      ]
    },
    {
      id: "pelatih-5",
      nama: "Ustadz Al-Hafizh Ahmad Fauzi, Lc.",
      keahlian: "Al-Qur'an Al-Karim Qira'ah Sab'ah",
      noHp: "+6287890123456",
      email: "ahmad.fauzi@assyifa.sch.id",
      honor: 18e5,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2020 - Sekarang", ekskul: "Takhassus Tahfidz As-Syifa", prestasi: "Mewisuda 25 Santri 30 Juz Mutqin" }
      ]
    }
  ],
  supervisors: [
    {
      id: "pembina-1",
      nama: "Ustadz Ahmad, M.Pd.",
      jabatan: "Kepala Humas & Guru Bahasa Arab",
      kontak: "+628129081230",
      ekskulBinaan: ["Panahan (Archery Club)", "Hadroh & Nasyid El-Syifa"]
    },
    {
      id: "pembina-2",
      nama: "Ustadzah Rina Kartika, S.Si.",
      jabatan: "Wakasek Kesiswaan & Guru Kimia",
      kontak: "+628135432109",
      ekskulBinaan: ["Robotics & IoT Club", "Tahfidz Al-Qur'an (Klub Takhassus)"]
    },
    {
      id: "pembina-3",
      nama: "Ustadz Deden Saepudin, S.Ag.",
      jabatan: "Guru PAI & Pengasuh Asrama Putra",
      kontak: "+628991234567",
      ekskulBinaan: ["Pencak Silat (Tapak Suci)"]
    }
  ],
  sops: [],
  schedules: [],
  attendance: [],
  competitions: [],
  assessments: [],
  evaluations: [],
  meetings: [],
  documents: [],
  notifications: [],
  auditLogs: [],
  users: [
    {
      id: "user-admin",
      username: "admin",
      password: "admin123",
      nama: "Beny Siswanto, S.Kom.",
      role: "Koordinator Ekstrakurikuler"
    },
    {
      id: "user-kepsek",
      username: "kepsek",
      password: "kepsek123",
      nama: "Beny Siswanto",
      role: "Kepala Sekolah"
    },
    {
      id: "user-pelatih",
      username: "pelatih",
      password: "pelatih123",
      nama: "Ust. Ahmad Fauzi",
      role: "Pelatih"
    },
    {
      id: "user-siswa-1",
      username: "zaki",
      password: "zaki123",
      nama: "Sahkan",
      role: "Siswa",
      linkedEntityId: "siswa-1"
    }
  ]
};
