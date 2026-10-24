import { PsikologUI, KategoriProfesional, JadwalUI } from '@/types/psikolog';

export function mapDbPsikologToUI(item: any): PsikologUI {
  const cat = (item.kategori || '').toLowerCase();
  let category: KategoriProfesional = 'psikolog';
  if (cat.includes('peer')) {
    category = 'peer-konselor';
  } else if (cat.includes('konselor')) {
    category = 'konselor';
  }

  let keahlianList: string[] = [];
  if (Array.isArray(item.keahlian)) {
    keahlianList = item.keahlian;
  } else if (typeof item.keahlian === 'string' && item.keahlian.trim()) {
    keahlianList = item.keahlian.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else {
    keahlianList = [];
  }

  // Format jadwal tersedia dari jadwal_slot dan localStorage (tanpa limit slice 3)
  let jadwalTersedia: JadwalUI[] = [];
  const rawSlots: any[] = [];

  if (item.jadwal_slot && Array.isArray(item.jadwal_slot)) {
    rawSlots.push(...item.jadwal_slot);
  }

  if (typeof window !== 'undefined') {
    try {
      const rawCustom = localStorage.getItem('empathika_custom_jadwal_slots');
      if (rawCustom) {
        const parsedCustom: any[] = JSON.parse(rawCustom);
        const matchingCustom = parsedCustom.filter(
          (s) =>
            s.id_psikolog === item.id ||
            s.id_psikolog === 'psikolog-default-id' ||
            s.id_psikolog === '1' ||
            (item.nama_gelar && s.nama_psikolog === item.nama_gelar) ||
            (item.account?.nama && s.nama_psikolog === item.account?.nama) ||
            (item.nama && s.nama_psikolog === item.nama) ||
            (item.nama_gelar && item.nama_gelar.includes('Rizki'))
        );
        rawSlots.push(...matchingCustom);
      }
    } catch {}
  }

  if (rawSlots.length > 0) {
    // Mendukung format "HH:MM" string maupun ISO datetime dari Prisma
    const parseJam = (val: any): string => {
      if (!val) return '00:00';
      if (typeof val === 'string') {
        const match = val.match(/(\d{2}:\d{2})/);
        if (match) return match[1];
      }
      if (val instanceof Date || (typeof val === 'string' && val.includes('T'))) {
        const d = new Date(val);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      }
      return '00:00';
    };

    const seenTimes = new Set<string>();
    const formattedSlots: JadwalUI[] = [];

    for (const slot of rawSlots) {
      const jamMulai = parseJam(slot.jam_mulai);
      const jamSelesai = parseJam(slot.jam_selesai);
      const labelWaktu = slot.label_waktu || `${jamMulai} - ${jamSelesai}`;

      if (!seenTimes.has(labelWaktu)) {
        seenTimes.add(labelWaktu);

        const metodeRaw = (slot.metode || slot.tipe_jadwal || '').toUpperCase();
        const tipe: 'online' | 'offline' = metodeRaw.includes('OFFLINE') ? 'offline' : 'online';

        formattedSlots.push({
          waktu: labelWaktu,
          tipe,
        });
      }
    }

    formattedSlots.sort((a, b) => a.waktu.localeCompare(b.waktu));
    jadwalTersedia = formattedSlots.slice(0, 3);
  } else if (item.jadwalTersedia && Array.isArray(item.jadwalTersedia)) {
    jadwalTersedia = item.jadwalTersedia;
  } else {
    jadwalTersedia = [];
  }

  return {
    id: item.id,
    id_spesialisasi: item.id_spesialisasi || 'spec',
    nama_gelar: item.nama_gelar || item.nama || item.account?.nama || 'Psikolog Empathika',
    email: item.account?.email || item.email || '',
    no_str: item.no_str || item.noStr || null,
    no_sipp: item.no_sipp || item.noSipp || null,
    no_silp: item.no_silp || item.noSilp || null,
    foto: item.foto || '/images/psikolog/default.jpg',
    bio: item.bio || 'Praktisi kesehatan mental profesional yang berdedikasi mendampingi proses pemulihan dan pertumbuhan diri klien.',
    quote: item.quote || 'Setiap perjalanan pemulihan dimulai dari keberanian untuk mendengarkan diri sendiri.',
    instagram: item.instagram || '@empathika.id',
    jenisKelamin: item.jenis_kelamin || item.jenisKelamin || 'Perempuan',
    pendidikanText: item.pendidikanText || item.pendidikan || 'Universitas Indonesia',
    keahlian: keahlianList,
    status: item.status || (item.statusAkses === 'AKTIF' ? 'ACTIVE' : 'INACTIVE'),
    jumlah_sesi: typeof item.jumlah_sesi === 'number' ? item.jumlah_sesi : (item.jumlahSesi ?? 0),
    tarif_per_jam: Number(item.tarif_per_jam) || 150000,
    spesialisasi: item.spesialisasi
      ? typeof item.spesialisasi === 'string'
        ? { id: 'spec-1', nama: item.spesialisasi }
        : {
            id: item.spesialisasi.id || 'spec-1',
            nama: item.spesialisasi.nama || item.kategori || 'Psikolog Klinis',
          }
      : {
          id: 'spec-1',
          nama: item.kategori || 'Psikolog Klinis',
        },
    category,
    experienceYears: item.pengalaman_tahun || item.experienceYears || '3 - 6 Tahun',
    labelJadwal: 'Jadwal Terdekat',
    jadwalTersedia,
  };
}
