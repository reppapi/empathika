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
  const bookedSlotKeys = new Set<string>();

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

  const parseDateKey = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    if (val instanceof Date) {
      return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
    }
    return null;
  };

  if (item.jadwal_slot && Array.isArray(item.jadwal_slot)) {
    rawSlots.push(...item.jadwal_slot);

    // Kumpulkan seluruh slot yang sudah dibooking atau tidak aktif di database
    item.jadwal_slot.forEach((s: any) => {
      const statusUpper = (s.status || '').toUpperCase();
      const isBooked =
        statusUpper === 'SUDAH_DIBOOKING' ||
        statusUpper === 'TIDAK_TERSEDIA' ||
        statusUpper === 'CANCELLED' ||
        Boolean(s.booking_konsultasi);

      if (isBooked) {
        const dKey = parseDateKey(s.tanggal);
        const jKey = parseJam(s.jam_mulai);
        if (dKey && jKey) bookedSlotKeys.add(`${dKey}_${jKey}`);
        if (jKey) bookedSlotKeys.add(jKey);
      }
    });
  }

  const hasDbSlots = Array.isArray(item.jadwal_slot) && item.jadwal_slot.length > 0;

  // Hanya gunakan localStorage jika belum ada data slot riil dari database
  if (!hasDbSlots && typeof window !== 'undefined') {
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
            (item.nama_gelar && s.nama_psikolog && (item.nama_gelar.toLowerCase().includes(s.nama_psikolog.toLowerCase()) || s.nama_psikolog.toLowerCase().includes(item.nama_gelar.toLowerCase()))) ||
            (item.nama_gelar && item.nama_gelar.includes('Rizki'))
        );
        rawSlots.push(...matchingCustom);
      }
    } catch {}
  }

  if (rawSlots.length > 0) {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseMinutes = (jamStr: string): number => {
      const parts = jamStr.split(':').map(Number);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    // Filter slot yang masih tersedia dan belum lewat jamnya
    const validSlots = rawSlots.filter((slot) => {
      // 1. Cek status slot jika tersedia
      const statusUpper = (slot.status || '').toUpperCase();
      if (statusUpper === 'SUDAH_DIBOOKING' || statusUpper === 'TIDAK_TERSEDIA' || statusUpper === 'CANCELLED') {
        return false;
      }

      const slotDate = parseDateKey(slot.tanggal);
      const jamMulai = parseJam(slot.jam_mulai);
      const startMinutes = parseMinutes(jamMulai);

      // Cek apakah slot ini sudah tercatat dibooking di database
      if (slotDate && bookedSlotKeys.has(`${slotDate}_${jamMulai}`)) {
        return false;
      }
      if (bookedSlotKeys.has(jamMulai)) {
        return false;
      }

      // 2. Jika ada tanggal spesifik:
      if (slotDate) {
        // Hari lampau -> sudah lewat
        if (slotDate < todayKey) return false;
        // Hari ini -> jam mulai sudah lewat dari jam sekarang
        if (slotDate === todayKey && currentMinutes >= startMinutes) {
          return false;
        }
        return true;
      }

      // 3. Jika tanpa tanggal spesifik, asumsikan hari ini dan cek jam mulai
      if (currentMinutes >= startMinutes) {
        return false;
      }

      return true;
    });

    const seenTimes = new Set<string>();
    const formattedSlots: { waktu: string; tipe: 'online' | 'offline'; dateKey: string; startMinutes: number }[] = [];

    for (const slot of validSlots) {
      const jamMulai = parseJam(slot.jam_mulai);
      const jamSelesai = parseJam(slot.jam_selesai);
      const labelWaktu = slot.label_waktu || `${jamMulai} - ${jamSelesai}`;
      const slotDateKey = parseDateKey(slot.tanggal) || todayKey;
      const uniqueKey = `${slotDateKey}_${labelWaktu}`;

      if (!seenTimes.has(uniqueKey)) {
        seenTimes.add(uniqueKey);

        const metodeRaw = (slot.metode || slot.tipe_jadwal || '').toUpperCase();
        const tipe: 'online' | 'offline' = metodeRaw.includes('OFFLINE') ? 'offline' : 'online';

        formattedSlots.push({
          waktu: labelWaktu,
          tipe,
          dateKey: slotDateKey,
          startMinutes: parseMinutes(jamMulai),
        });
      }
    }

    // Urutkan jadwal yang paling dekat: tanggal terdekat -> jam terdekat
    formattedSlots.sort((a, b) => {
      if (a.dateKey !== b.dateKey) {
        return a.dateKey.localeCompare(b.dateKey);
      }
      return a.startMinutes - b.startMinutes;
    });

    jadwalTersedia = formattedSlots.slice(0, 3).map((s) => ({
      waktu: s.waktu,
      tipe: s.tipe,
    }));
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
