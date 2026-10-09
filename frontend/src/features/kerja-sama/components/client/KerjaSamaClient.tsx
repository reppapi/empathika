"use client"
import React from 'react';
import Link from 'next/link';

export default function KerjaSamaClient() {
  const collaborationLinks = [
    { title: 'Empathika untuk Mahasiswa', href: '/kerja-sama/mahasiswa', icon: 'M12 14l9-5-9-5-9 5 9 5z', icon2: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', color: 'from-purple-500 to-indigo-600' },
    { title: 'Empathika untuk Sekolah', href: '/kerja-sama/sekolah', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'from-blue-400 to-blue-600' },
    { title: 'Empathika untuk Komunitas', href: '/kerja-sama/komunitas', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-emerald-400 to-teal-500' },
    { title: 'Empathika untuk Perusahaan', href: '/kerja-sama/perusahaan', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-orange-400 to-red-500' },
    { title: 'Empathika untuk Pemerintah', href: '/kerja-sama/pemerintah', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', color: 'from-gray-600 to-gray-800' },
    { title: 'Empathika untuk Rumah Sakit', href: '/kerja-sama/rumah-sakit', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'from-pink-400 to-rose-500' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#fbfbfb] font-sans pb-24 pt-32 lg:pt-40 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-pink-200/30 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col items-center gap-6">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2a0835] text-center leading-[1.1] tracking-tight">
            Bangun Kolaborasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#561269] to-[#8e4a9e]">Bersama Empathika!</span>
          </h1>
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed text-center font-light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <div className="w-full h-48 md:h-80 bg-gray-300 rounded-lg mt-4 mb-4"></div>
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed text-center font-light mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <div className="w-full text-center mt-2 mb-2">
            <p className="text-sm font-bold text-[#561269] tracking-wider uppercase">-- Pilih Jenis Kolaborasi Di Bawah Ini --</p>
          </div>
          
          {/* NEW DESIGN CARD OPTIONS */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {collaborationLinks.map((link, idx) => (
              <Link key={idx} href={link.href as any} className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col items-center text-center">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gray-50 group-hover:bg-gradient-to-br ${link.color} transition-colors duration-300 shadow-inner`}>
                  <svg className="w-7 h-7 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon}></path>
                    {link.icon2 && <path strokeLinecap="round" strokeLinejoin="round" d={link.icon2}></path>}
                  </svg>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#561269] transition-colors">{link.title.replace('Empathika untuk ', '')}</h3>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#561269] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  Lihat Detail
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </Link>
            ))}
          </div>

          {/* ORIGINAL DESIGN BOTTOM SECTION (without white card box, just text) */}
          <div className="w-full mt-4 text-left max-w-3xl mx-auto z-10">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed mb-4">
              Punya ide kolaborasi lainnya?<br />
              Empathika terbuka untuk berbagai ide dan bentuk kolaborasi yang dapat memberikan manfaat bagi masyarakat. Mari bersama-sama menciptakan ruang yang mendukung kesehatan dan kesejahteraan psikologis.<br />
              Hubungi contact person kami dan mari berkolaborasi bersama Empathika.
            </p>
            
            <h4 className="text-[#561269] font-bold mb-2">KONTAK KAMI:</h4>
            <ul className="text-sm md:text-base text-gray-800 space-y-1">
              <li>Email:</li>
              <li>Whatsapp:</li>
              <li>Formulir In House Training:</li>
              <li>Formulir Kerjasama Asesmen dan Tes Psikologi:</li>
              <li>Formulir Affiliate: (Langsung ke kontak)</li>
              <li>Formulir Kerjasama Lainnya:</li>
            </ul>
          </div>
          
        </div>

      </div>
    </div>
  );
}
