import { AppDatabase } from "./types";

export const initialDatabase: AppDatabase = {
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
      logo: "🎯",
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
      logo: "🤖",
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
      logo: "🥋",
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
      logo: "🥁",
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
      logo: "📖",
      galeri: []
    }
  ],
  students: [
    {
      id: "siswa-1",
      nama: "Muhammad Zaki Al-Fatih",
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
      nama: "Farhan Syihabuddin",
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
      nama: "Khansa Alya Nabila",
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
      nama: "Ustadz Hardi Supriatna, S.Pd., C.Ar",
      keahlian: "Pelatih Panahan Lisensi Nasional (PERPANI)",
      noHp: "+6281312345678",
      email: "hardi.supriatna@assyifa.sch.id",
      honor: 1500000,
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
      honor: 2000000,
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
      honor: 1200000,
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
      honor: 1000000,
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
      honor: 1800000,
      status: "Aktif",
      riwayatMengajar: [
        { tahun: "2020 - Sekarang", ekskul: "Takhassus Tahfidz As-Syifa", prestasi: "Mewisuda 25 Santri 30 Juz Mutqin" }
      ]
    }
  ],
  supervisors: [
    {
      id: "pembina-1",
      nama: "Ustadz Muhammad Wildan, M.Pd.",
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
  sops: [
    {
      id: "sop-1",
      judul: "SOP Kualifikasi & Kedisiplinan Pelatih Ekstrakurikuler",
      kategori: "SOP Pelatih",
      konten: `# SOP KUALIFIKASI DAN KEDISIPLINAN PELATIH
**SMAIT As-Syifa Boarding School Wanareja**

### 1. Kualifikasi Utama
- Memiliki sertifikasi atau lisensi resmi di bidang keahliannya (PERPANI, Tapak Suci, Dikti, dll).
- Memiliki akhlakul karimah yang baik, tidak merokok di lingkungan sekolah, dan berbusana sopan Islami.
- Mampu menyelaraskan kurikulum teknis dengan nilai-nilai kepesantrenan / dakwah.

### 2. Kedisiplinan Kehadiran
- Pelatih wajib hadir minimal **15 menit** sebelum jadwal kegiatan dimulai.
- Mengisi daftar hadir manual atau digital (AEMS QR Code/Selfie).
- Toleransi keterlambatan maksimal 10 menit. Jika terlambat, wajib melakukan konfirmasi kepada Koordinator Ekskul.

### 3. Evaluasi Berkala
- Pelatih wajib menyerahkan Rencana Kegiatan Mingguan (RKM) di awal bulan.
- Mengisi laporan capaian target latihan siswa pada akhir semester.`,
      versi: "v2.1",
      fileName: "SOP_Kualifikasi_Dan_Disiplin_Pelatih.pdf",
      fileUrl: "/docs/sop/SOP_Kualifikasi_Dan_Disiplin_Pelatih.pdf",
      riwayatPerubahan: [
        { id: "rh-1", tanggal: "2026-01-10", versi: "v1.0", diubahOleh: "Koordinator Ekskul", deskripsi: "Inisiasi draf SOP pertama." },
        { id: "rh-2", tanggal: "2026-05-15", versi: "v2.1", diubahOleh: "Kepala Sekolah", deskripsi: "Penambahan kewajiban presensi digital foto selfie & geolokasi GPS." }
      ]
    },
    {
      id: "sop-2",
      judul: "SOP Keselamatan Latihan Panahan & Olahraga Berkuda",
      kategori: "SOP Keselamatan",
      konten: `# SOP KESELAMATAN LATIHAN PANAHAN & BERKUDA
**SMAIT As-Syifa Boarding School Wanareja**

### 1. Aturan Umum Keselamatan Area
- Garis tembak (shooting line) harus clear dari siapa pun sebelum aba-aba tembak dilepaskan.
- Busur dan anak panah hanya boleh diarahkan ke target. Dilarang keras mengarahkan ke arah santri lain sekalipun bercanda.
- Penonton wajib berdiri minimal 5 meter di belakang garis tembak.

### 2. Peralatan Keamanan (Safety Gear)
- Santri wajib mengenakan pelindung dada (chest guard), pelindung lengan (arm guard), dan pelindung jari (finger tab).
- Pelatih harus memastikan busur dan anak panah dalam kondisi prima (tidak ada retak atau string yang aus).

### 3. Penanganan Cedera Darurat
- Jika terjadi luka gores, segera bawa ke kotak P3K darurat di lapangan.
- Cedera serius wajib langsung dirujuk ke Klinik As-Syifa Wanareja dibantu oleh Pembina Pendamping.`,
      versi: "v1.3",
      fileName: "SOP_Keselamatan_Panahan_Berkuda.pdf",
      fileUrl: "/docs/sop/SOP_Keselamatan_Panahan_Berkuda.pdf",
      riwayatPerubahan: [
        { id: "rh-3", tanggal: "2026-03-20", versi: "v1.3", diubahOleh: "Koordinator Ekskul", deskripsi: "Penambahan bagian penggunaan pelindung wajib (Chest & Arm Guard)." }
      ]
    },
    {
      id: "sop-3",
      judul: "SOP Prosedur Perizinan Mengikuti Lomba Luar Kampus",
      kategori: "SOP Perlombaan",
      konten: `# SOP PROSEDUR PERIZINAN PERLOMBAAN OUT-OF-CAMPUS
**SMAIT As-Syifa Boarding School Wanareja**

### 1. Pengajuan Surat Mandat
- Pelatih berdiskusi dengan Koordinator Ekskul terkait undangan perlombaan minimal **H-30**.
- Mengisi berkas pendaftaran dan proposal anggaran dana perlombaan.

### 2. Alur Persetujuan (Workflow Approval)
1. **Koordinator Ekskul**: Memeriksa kelayakan dan ketersediaan anggaran.
2. **Kepala Sekolah**: Memberikan izin resmi melalui penandatanganan Surat Tugas Mandat.
3. **Wali Kelas & Kepala Asrama**: Mendapat pemberitahuan tertulis izin dispensasi (dispensation) akademik santri peserta.
4. **Orang Tua**: Mendapat surat permohonan izin/ridho tertulis via WA/Sistem.

### 3. Laporan Pasca-Lomba
- Santri dan Pembina pendamping wajib menyusun Laporan Pertanggungjawaban (LPJ) maksimal H+7 setelah acara selesai.`,
      versi: "v1.0",
      fileName: "SOP_Prosedur_Izin_Lomba.pdf",
      fileUrl: "/docs/sop/SOP_Prosedur_Izin_Lomba.pdf",
      riwayatPerubahan: [
        { id: "rh-4", tanggal: "2026-02-12", versi: "v1.0", diubahOleh: "Wakasek Kesiswaan", deskripsi: "Penerbitan SOP perizinan resmi lomba." }
      ]
    }
  ],
  schedules: [
    {
      id: "sch-1",
      judul: "Latihan Rutin Panahan",
      ekskulId: "ekskul-1",
      tanggal: "2026-07-04",
      jamMulai: "08:00",
      jamSelesai: "10:00",
      tempat: "Lapangan Panahan Utama",
      tipe: "Latihan Rutin",
      keterangan: "Materi penyesuaian grip dan akurasi rilis 20 meter. Santri dihimbau membawa baju olahraga syar'i.",
      color: "#16a34a"
    },
    {
      id: "sch-2",
      judul: "Praktikum Pemrograman IoT Arduino",
      ekskulId: "ekskul-2",
      tanggal: "2026-07-09",
      jamMulai: "16:00",
      jamSelesai: "17:30",
      tempat: "Lab STEM",
      tipe: "Latihan Rutin",
      keterangan: "Praktik membaca sensor suhu DHT11 dan mengirim data ke dashboard web.",
      color: "#d97706"
    },
    {
      id: "sch-3",
      judul: "Ujian Kenaikan Tingkat Tapak Suci",
      ekskulId: "ekskul-3",
      tanggal: "2026-07-06",
      jamMulai: "15:45",
      jamSelesai: "18:00",
      tempat: "GSG As-Syifa",
      tipe: "Ujian Kenaikan Tingkat",
      keterangan: "Pengujian jurus dasar, ketahanan fisik, dan wawasan keislaman Tapak Suci.",
      color: "#dc2626"
    },
    {
      id: "sch-4",
      judul: "Rapat Koordinasi Evaluasi Semester Ganjil",
      ekskulId: "",
      tanggal: "2026-07-08",
      jamMulai: "13:30",
      jamSelesai: "15:00",
      tempat: "Meeting Room Kantor Kesiswaan",
      tipe: "Rapat Koordinasi",
      keterangan: "Rapat evaluasi progres latihan ekskul, rekapitulasi honorarium pelatih, dan usulan perlombaan.",
      color: "#4f46e5"
    }
  ],
  attendance: [
    {
      id: "pres-1",
      ekskulId: "ekskul-1",
      tanggal: "2026-06-27",
      siswaId: "siswa-1",
      namaSiswa: "Muhammad Zaki Al-Fatih",
      kelas: "XI-A IPA",
      asrama: "Gedung Shalahuddin Al-Ayyubi Kamar 4",
      waktuMasuk: "07:55",
      waktuPulang: "10:05",
      status: "Hadir",
      metode: "QR Code",
      gpsCoordinates: { latitude: -6.5678, longitude: 107.789, distanceFromSchool: 15 }
    },
    {
      id: "pres-2",
      ekskulId: "ekskul-1",
      tanggal: "2026-06-27",
      siswaId: "siswa-2",
      namaSiswa: "Ahmad Rayhan Al-Ghifari",
      kelas: "XI-B IPA",
      asrama: "Gedung Shalahuddin Al-Ayyubi Kamar 6",
      waktuMasuk: "08:05",
      waktuPulang: "10:00",
      status: "Terlambat",
      metode: "Foto Selfie",
      fotoSelfie: "selfie_rayhan.jpg",
      gpsCoordinates: { latitude: -6.5679, longitude: 107.7891, distanceFromSchool: 22 }
    },
    {
      id: "pres-3",
      ekskulId: "ekskul-1",
      tanggal: "2026-06-27",
      siswaId: "siswa-4",
      namaSiswa: "Khansa Alya Nabila",
      kelas: "XI-E IPA (Santriwati)",
      asrama: "Gedung Khadijah Kamar 3",
      waktuMasuk: "07:48",
      waktuPulang: "10:02",
      status: "Hadir",
      metode: "GPS",
      gpsCoordinates: { latitude: -6.5677, longitude: 107.7889, distanceFromSchool: 8 }
    },
    {
      id: "pres-4",
      ekskulId: "ekskul-2",
      tanggal: "2026-06-25",
      siswaId: "siswa-1",
      namaSiswa: "Muhammad Zaki Al-Fatih",
      kelas: "XI-A IPA",
      asrama: "Gedung Shalahuddin Al-Ayyubi Kamar 4",
      waktuMasuk: "15:58",
      waktuPulang: "17:35",
      status: "Hadir",
      metode: "QR Code"
    },
    {
      id: "pres-5",
      ekskulId: "ekskul-2",
      tanggal: "2026-06-25",
      siswaId: "siswa-5",
      namaSiswa: "Naila Syifa Azzahra",
      kelas: "X-F IPA (Santriwati)",
      asrama: "Gedung Aisyah Kamar 8",
      waktuMasuk: "00:00",
      status: "Izin",
      metode: "Manual",
      gpsCoordinates: undefined
    }
  ],
  competitions: [
    {
      id: "lomba-1",
      namaLomba: "Kejuaraan Panahan Antar-Pelajar Jabar (Bogor Open 2026)",
      penyelenggara: "Pengprov PERPANI Jawa Barat",
      lokasi: "Stadion Pajajaran Bogor",
      tanggal: "2026-08-15",
      deadline: "2026-07-25",
      biaya: 450000,
      persyaratan: ["Surat Mandat Sekolah", "Fotokopi Kartu Pelajar", "Sertifikasi Kelayakan Panahan Jarak 20m"],
      pesertaIds: ["siswa-1", "siswa-2", "siswa-4"],
      ekskulId: "ekskul-1",
      target: "Menduduki Peringkat 3 Besar Beregu & 1 Medali Emas Individu Putra",
      prestasi: "Mempersiapkan Tim Utama (Daftar Terkirim)",
      dokumentasi: ["https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"]
    },
    {
      id: "lomba-2",
      namaLomba: "Olimpiade Robotika Nasional (Indonesian Robotics Olympiad)",
      penyelenggara: "Kementerian Ristekdikti & Indonesian Robotics Society",
      lokasi: "Gedung Balai Kartini, Jakarta",
      tanggal: "2026-09-02",
      deadline: "2026-08-10",
      biaya: 750000,
      persyaratan: ["Usia maksimal 17 tahun", "Proposal rancangan robot penyelamat bencana", "Video demo prototype"],
      pesertaIds: ["siswa-1", "siswa-5"],
      ekskulId: "ekskul-2",
      target: "Juara Harapan Utama & Kategori Inovasi Desain Terbaik",
      prestasi: "Sedang menyelesaikan perakitan mekanis robot",
      dokumentasi: ["https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=800&q=80"]
    },
    {
      id: "lomba-3",
      namaLomba: "Festival Shalawat & Da'wah Pelajar Kabupaten Subang",
      penyelenggara: "Kemenag Subang",
      lokasi: "Aula Pemda Subang",
      tanggal: "2026-05-24",
      deadline: "2026-05-10",
      biaya: 200000,
      persyaratan: ["Rekomendasi Pondok Pesantren", "Membawa alat rebana mandiri"],
      pesertaIds: ["siswa-3"],
      ekskulId: "ekskul-4",
      target: "Juara 1 Tingkat Kabupaten",
      prestasi: "🏆 Juara 1 Tingkat Kabupaten Subang",
      dokumentasi: ["https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80"]
    }
  ],
  assessments: [
    {
      id: "ass-1",
      pelatihId: "pelatih-1",
      namaPelatih: "Ustadz Hardi Supriatna, S.Pd., C.Ar",
      ekskulId: "ekskul-1",
      tanggal: "2026-06-30",
      disiplin: 95,
      kehadiran: 98,
      ketepatanWaktu: 92,
      kualitasLatihan: 96,
      komunikasi: 90,
      pengelolaanPeserta: 94,
      administrasi: 88,
      pencapaianTarget: 95,
      prestasi: 90,
      inovasi: 85,
      kerjaSama: 92,
      sikap: 96,
      skorRata: 92.67,
      rekomendasi: "Sangat direkomendasikan untuk melanjutkan kontrak kerja pelatih pada tahun ajaran berikutnya dengan bonus insentif prestasi atlet."
    },
    {
      id: "ass-2",
      pelatihId: "pelatih-2",
      namaPelatih: "Ir. Ahmad Sholahudin, M.T.",
      ekskulId: "ekskul-2",
      tanggal: "2026-06-30",
      disiplin: 88,
      kehadiran: 90,
      ketepatanWaktu: 85,
      kualitasLatihan: 95,
      komunikasi: 92,
      pengelolaanPeserta: 87,
      administrasi: 80,
      pencapaianTarget: 90,
      prestasi: 85,
      inovasi: 96,
      kerjaSama: 89,
      sikap: 92,
      skorRata: 89.08,
      rekomendasi: "Pelatih memiliki kualitas keilmuan teknologi yang luar biasa tinggi. Administrasi RKM (Rencana Kegiatan) perlu diperbaiki agar terdokumentasi lebih rapi."
    }
  ],
  evaluations: [
    {
      id: "eval-1",
      tipe: "Bulanan",
      tanggal: "2026-06-29",
      catatan: "Latihan rutin panahan berjalan sangat kondusif. Akurasi rata-rata tembakan santri naik signifikan dari 15 meter menjadi 20 meter. Kehadiran santri mencapai 91.5%.",
      target: "Mempersiapkan tim inti berisi 3 santri terpilih untuk dikirim ke Bogor Open Open Championship Agustus mendatang.",
      rekomendasi: "Pembelian string busur baru sebanyak 5 set dan pelindung lengan tambahan karena beberapa yang lama mulai kendur.",
      tindakLanjut: "Mengajukan anggaran pembelian alat panahan ke bendahara sekolah melalui Wakasek Sarana Prasarana.",
      lampiran: "Laporan_Panahan_Juni.pdf",
      ekskulId: "ekskul-1"
    },
    {
      id: "eval-2",
      tipe: "Semester",
      tanggal: "2026-06-15",
      catatan: "Ekskul Robotics telah berhasil merancang 3 proyek robotika siap pameran. Namun, pemahaman teori mikrokontroler dasar beberapa santri kelas X masih agak kurang.",
      target: "Mengadakan pelatihan crash-course basic coding C++ Arduino di awal semester genap.",
      rekomendasi: "Kolaborasi intensif dengan guru informatika sekolah untuk penyelarasan kurikulum pemrograman dasar.",
      tindakLanjut: "Rapat koordinasi dengan MGMP Informatika SMAIT As-Syifa.",
      lampiran: "Evaluasi_SainsTek_Smt1.docx",
      ekskulId: "ekskul-2"
    }
  ],
  meetings: [
    {
      id: "meet-1",
      agenda: "Rapat Persiapan Pembukaan Ekstrakurikuler Semester Ganjil 2026/2027",
      tanggal: "2026-06-20",
      undangan: ["Kepala Sekolah", "Koordinator Ekstrakurikuler", "Semua Pembina Ekskul", "Semua Pelatih"],
      presensiList: [
        { nama: "Ustadz H. Gozali, M.Pd. (Kepala Sekolah)", peran: "Kepala Sekolah", hadir: true },
        { nama: "Ustadz Reza Firmansyah, S.Pd. (Koordinator)", peran: "Koordinator", hadir: true },
        { nama: "Ustadz Muhammad Wildan, M.Pd.", peran: "Pembina Panahan", hadir: true },
        { nama: "Ustadz Hardi Supriatna", peran: "Pelatih Panahan", hadir: true },
        { nama: "Ir. Ahmad Sholahudin", peran: "Pelatih Robotika", hadir: false }
      ],
      notulen: "Pertemuan membahas pemantapan kurikulum ekskul berorientasi prestasi dakwah. Ditentukan kuota maksimal setiap ekskul adalah 30-50 anak agar pengawasan asrama tetap efektif. Honorarium pelatih akan ditransfer paling lambat tanggal 5 setiap bulannya.",
      dokumentasiUrl: "rapat_pembukaan.jpg",
      hasilRapat: "Persetujuan kalender kegiatan tahunan, peluncuran sistem AEMS digital untuk absensi santri, serta penandatanganan pakta integritas disiplin melatih.",
      tugas: [
        { id: "task-1", tugas: "Penyebaran formulir pemilihan ekskul santri baru via AEMS", ditugaskanKepada: "Koordinator Ekskul", deadline: "2026-07-05", progress: 90, status: "Sedang Dikerjakan" },
        { id: "task-2", tugas: "Mempersiapkan busur dan target lapangan panahan", ditugaskanKepada: "Ustadz Hardi (Pelatih)", deadline: "2026-07-03", progress: 100, status: "Selesai" },
        { id: "task-3", tugas: "Mengupload berkas SK Mengajar Pelatih Baru", ditugaskanKepada: "Wakasek Kesiswaan", deadline: "2026-07-10", progress: 20, status: "Belum Dimulai" }
      ]
    }
  ],
  documents: [
    {
      id: "doc-1",
      judul: "SK Izin Operasional Ekstrakurikuler 2026",
      nama: "SK_Izin_Operasional_Ekstrakurikuler_2026.pdf",
      tipe: "SK",
      kategori: "Surat Perizinan",
      deskripsi: "Surat Keputusan Yayasan As-Syifa Al-Khoeriyyah tentang Izin Operasional dan Pembagian Guru Pendamping Ekstrakurikuler SMAIT As-Syifa Wanareja.",
      ekskulId: "ekskul-1",
      tanggalDibuat: "2026-06-01",
      tanggalUpload: "2026-06-01",
      status: "Disetujui",
      pengaju: "Koordinator Ekstrakurikuler",
      fileUrl: "/docs/SK_Kesiswaan_2026.pdf",
      tandaTanganDigital: "Ust. Reza"
    },
    {
      id: "doc-2",
      judul: "SOP Pemberian Reward Prestasi Santri",
      nama: "SOP_Pemberian_Reward_Prestasi_Santri.pdf",
      tipe: "SOP",
      kategori: "Surat Perizinan",
      deskripsi: "SOP resmi pemberian beasiswa bebas SPP dan reward pembinaan bagi santri peraih medali tingkat Nasional & Provinsi.",
      ekskulId: "ekskul-2",
      tanggalDibuat: "2026-05-18",
      tanggalUpload: "2026-05-18",
      status: "Disetujui",
      pengaju: "Koordinator Ekstrakurikuler",
      fileUrl: "/docs/SOP_Beasiswa_Prestasi.pdf",
      tandaTanganDigital: "Ust. Reza"
    },
    {
      id: "doc-4",
      judul: "Biodata Diri - Muhammad Syamil Basayev",
      nama: "Biodata_Siswa_Syamil_Basayev.pdf",
      tipe: "SOP",
      kategori: "Biodata Siswa",
      deskripsi: "Formulir biodata lengkap, rekam kesehatan asrama, dan surat izin orang tua untuk keikutsertaan ekskul Panahan.",
      ekskulId: "ekskul-1",
      siswaId: "siswa-1",
      namaSiswa: "Muhammad Syamil Basayev",
      tanggalDibuat: "2026-07-01",
      tanggalUpload: "2026-07-01",
      status: "Disetujui",
      pengaju: "Siswa (Muhammad Syamil Basayev)",
      fileUrl: "/docs/Biodata_Siswa_Syamil.pdf"
    },
    {
      id: "doc-5",
      judul: "Kartu Pelajar & Syarat Lomba Jabar Archery - Khansa Alya Nabila",
      nama: "Persyaratan_Lomba_Jabar_Archery_Khansa.pdf",
      tipe: "SOP",
      kategori: "Persyaratan Lomba",
      deskripsi: "Berkas kelengkapan administrasi lomba Jabar Archery Championship, termasuk Kartu Tanda Santri, surat sehat, dan pas foto resmi.",
      ekskulId: "ekskul-1",
      siswaId: "siswa-4",
      namaSiswa: "Khansa Alya Nabila",
      tanggalDibuat: "2026-07-02",
      tanggalUpload: "2026-07-02",
      status: "Disetujui",
      pengaju: "Siswa (Khansa Alya Nabila)",
      fileUrl: "/docs/Syarat_Lomba_Jabar_Khansa.pdf"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      tipe: "Dashboard",
      pesan: "Jadwal Latihan Rutin Panahan Sabtuan esok hari pukul 08:00 siap dilaksanakan. Harap pelatih menyiapkan target jarak baru.",
      tanggal: "2026-07-03 16:00",
      dibaca: false,
      pengirim: "Koordinator Ekskul"
    },
    {
      id: "notif-2",
      tipe: "WhatsApp",
      pesan: "INFO LOMBA: Pendaftaran Bogor Open Open Archery ditutup 5 hari lagi! Pastikan kelengkapan berkas siswa Muhammad Zaki dan Khansa sudah siap.",
      tanggal: "2026-07-20 09:12",
      dibaca: true,
      pengirim: "Sistem Notifikasi AEMS"
    },
    {
      id: "notif-3",
      tipe: "Email",
      pesan: "Hasil Penilaian Kinerja Bulanan Ustadz Hardi Supriatna telah disetujui Kepala Sekolah dengan predikat SANGAT MEMUASKAN.",
      tanggal: "2026-07-01 10:30",
      dibaca: false,
      pengirim: "Kepala Sekolah"
    }
  ],
  auditLogs: [
    {
      id: "log-1",
      tanggal: "2026-07-03 18:00:15",
      user: "Ustadz Reza (Koordinator)",
      peran: "Koordinator Ekstrakurikuler",
      aktivitas: "Melakukan Pembaruan Data Siswa",
      detail: "Menambahkan ekstrakurikuler Robotics ke riwayat santri Muhammad Zaki Al-Fatih."
    },
    {
      id: "log-2",
      tanggal: "2026-07-03 15:20:44",
      user: "Ustadz Hardi (Pelatih)",
      peran: "Pelatih",
      aktivitas: "Mengisi Presensi Digital",
      detail: "Berhasil melakukan presensi masuk manual untuk santriwati Khansa Alya Nabila."
    }
  ],
  users: [
    {
      id: "user-admin",
      username: "admin",
      password: "admin123",
      nama: "Ustadz Reza Firmansyah",
      role: "Koordinator Ekstrakurikuler"
    },
    {
      id: "user-kepsek",
      username: "kepsek",
      password: "kepsek123",
      nama: "Dr. H. Faisal Ahmad",
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
      nama: "Muhammad Zaki Al-Fatih",
      role: "Siswa",
      linkedEntityId: "siswa-1"
    }
  ]
};
