'use client';

import { useState, useMemo } from 'react';
import { PsikologUI } from '@/types/psikolog';

export function useFilterPsikolog(dataAwal: PsikologUI[]) {
  const [kategoriAktif, setKategoriAktif] = useState<string>('semua');
  const [search, setSearch] = useState<string>('');

  const dataTerfilter = useMemo(() => {
    return dataAwal.filter((item) => {
      const matchKategori =
        kategoriAktif === 'semua' || item.category === kategoriAktif;
      const matchSearch =
        !search ||
        item.nama_gelar.toLowerCase().includes(search.toLowerCase()) ||
        (item.spesialisasi?.nama && item.spesialisasi.nama.toLowerCase().includes(search.toLowerCase())) ||
        (item.bio && item.bio.toLowerCase().includes(search.toLowerCase()));

      return matchKategori && matchSearch;
    });
  }, [kategoriAktif, search, dataAwal]);

  return {
    kategoriAktif,
    setKategoriAktif,
    search,
    setSearch,
    dataTerfilter,
  };
}