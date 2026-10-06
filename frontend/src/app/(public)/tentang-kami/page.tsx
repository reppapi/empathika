import React from 'react'
import { CtaSection } from '@/features/psikolog/components/CtaSection'

export default function TentangKamiPage() {
  return (
    <div className="w-full font-sans bg-[#fbfbfb] text-gray-900 overflow-hidden pb-0 -mt-36 lg:-mt-24">

      {/* ================================================================= */}
      {/* 1. HERO SECTION: Clean & Modern */}
      {/* ================================================================= */}
      <section className="relative w-full pt-60 md:pt-64 lg:pt-72 pb-24 lg:pb-32 bg-gradient-to-b from-[#f4f2ee] to-[#fbfbfb]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold text-[#2a0835] mb-6 leading-[1.1] tracking-tight">
            Tentang <span className="text-[#561269]">Empathika</span>
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg lg:text-xl font-light mb-16 md:mb-24 leading-relaxed">
            Ruang yang kami bangun untuk menemani setiap langkah menuju pemahaman dan pertumbuhan diri.
          </p>

          {/* Modern Compact Staggered Grid (Bento Style) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto h-auto md:h-[320px] mt-4">

            {/* Column 1 */}
            <div className="flex flex-col gap-4 md:translate-y-6">
              <div className="h-[120px] md:h-[140px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Empathika Community" />
              </div>
              <div className="h-[140px] md:h-[160px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Empathika Professional" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="hidden md:block h-[260px] md:h-[280px] rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow translate-y-2">
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Empathika Main" />
            </div>

            {/* Column 3 */}
            <div className="h-[200px] md:h-[300px] rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow md:-translate-y-4">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Empathika Session" />
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-4 md:translate-y-8">
              <div className="h-[160px] md:h-[180px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Empathika Group" />
              </div>
              <div className="h-[100px] md:h-[120px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Empathika Activity" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. MARI BERKENALAN (Grid Layout for clean typography) */}
      {/* ================================================================= */}
      <section className="w-full py-24 lg:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start lg:items-center">
            <div className="lg:w-5/12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#561269] leading-[1.1] tracking-tight">
                Mari Berkenalan dengan Empathika.
              </h2>
            </div>
            <div className="lg:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 text-base md:text-lg leading-relaxed font-light">
              <p>
                Empathika hadir sebagai ruang bagi siapa pun yang ingin lebih memahami diri, bertumbuh, dan menjalani setiap proses dengan lebih baik. Kami percaya bahwa kesehatan mental adalah bagian penting dari kesejahteraan hidup, sama pentingnya dengan kesehatan fisik. Melalui layanan psikologi, kami ingin membuat akses terhadap bantuan profesional terasa lebih dekat, nyaman, dan mudah dijangkau. Bersama para psikolog dan tenaga profesional, kami menghadirkan ruang yang aman untuk bercerita, belajar, dan menemukan langkah yang sesuai dengan kebutuhanmu.
              </p>
              <p>
                Setiap orang memiliki cerita dan perjalanan yang berbeda. Karena itu, Empathika hadir untuk menemani, bukan menghakimi. Kami ingin menjadi bagian dari perjalananmu dalam memahami diri, menghadapi berbagai proses, dan tumbuh menjadi versi diri yang lebih baik. Bagi kami, mendapatkan bantuan bukanlah tanda kelemahan, melainkan sebuah langkah untuk lebih peduli pada diri sendiri dan menjalani kehidupan dengan lebih baik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. NILAI YANG KAMI BAWA (Organic Premium Journey) */}
      {/* ================================================================= */}


      <section className="w-full py-16 md:py-24 bg-[#fbfbfb] relative overflow-hidden">
        {/* Title Container (Constrained) */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#561269] mb-4 drop-shadow-sm">Nilai yang Kami Bawa</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Kami berpegang teguh pada nilai-nilai ini dalam setiap langkah perjalanan untuk mendukung kesejahteraan mental Anda.</p>
        </div>

        {/* Tabbed Chevron Container (Full Width Edge-to-Edge) */}
        <div className="flex flex-col lg:flex-row w-full items-stretch">

          {/* Block 1: Empati */}
          <div className="relative flex-1 z-40 drop-shadow-[0_8px_15px_rgba(0,0,0,0.2)] lg:drop-shadow-[12px_0_15px_rgba(0,0,0,0.25)] group">
            <div className="w-full h-full bg-[#491c68] relative
              [clip-path:polygon(0_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%)]
              transition-transform duration-500 hover:scale-[1.02] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-10 pb-16 px-6 sm:px-10 md:px-16 
              lg:pt-10 lg:pb-10 lg:pl-10 xl:pl-12 lg:pr-16"
            >
              {/* 3D Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/50 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] border-[2px] border-white/20 mb-4 lg:mb-5 group-hover:-translate-y-2 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h3 className="font-black text-2xl lg:text-3xl text-white mb-2 lg:mb-3 drop-shadow-md tracking-tight">Empati</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed font-medium drop-shadow-sm max-w-sm">Mendengarkan tanpa menghakimi dan memahami potensi diri Anda sepenuhnya.</p>
              </div>
            </div>
          </div>

          {/* Block 2: Profesional */}
          <div className="relative flex-1 z-30 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.15)] lg:drop-shadow-[12px_0_15px_rgba(0,0,0,0.2)] group">
            <div className="w-full h-full bg-[#7f5195] relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.02] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-16 px-6 sm:px-10 md:px-16
              lg:pt-10 lg:pb-10 lg:pl-16 xl:pl-20 lg:pr-16"
            >
              {/* 3D Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] border-[2px] border-white/20 mb-4 lg:mb-5 group-hover:-translate-y-2 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <h3 className="font-black text-2xl lg:text-3xl text-white mb-2 lg:mb-3 drop-shadow-md tracking-tight">Profesional</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed font-medium drop-shadow-sm max-w-sm">Tenaga ahli klinis berlisensi dengan standar dan peran kompetensi yang tinggi.</p>
              </div>
            </div>
          </div>

          {/* Block 3: Privasi Terjaga */}
          <div className="relative flex-1 z-20 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.1)] lg:drop-shadow-[12px_0_15px_rgba(0,0,0,0.15)] group">
            <div className="w-full h-full bg-[#cdb1db] relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.02] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-16 px-6 sm:px-10 md:px-16
              lg:pt-10 lg:pb-10 lg:pl-16 xl:pl-20 lg:pr-16"
            >
              {/* 3D Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/30 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/40 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-[2px] border-white/60 mb-4 lg:mb-5 group-hover:-translate-y-2 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/50 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-[#491c68] drop-shadow-sm relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="font-black text-2xl lg:text-3xl text-[#491c68] mb-2 lg:mb-3 drop-shadow-sm tracking-tight">Privasi Terjaga</h3>
                <p className="text-[#491c68]/90 text-sm lg:text-base leading-relaxed font-medium drop-shadow-sm max-w-sm">Kerahasiaan data setiap orang dan cerita Anda adalah prioritas mutlak kami.</p>
              </div>
            </div>
          </div>

          {/* Block 4: Solutif Aktif */}
          <div className="relative flex-1 z-10 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.05)] lg:drop-shadow-[12px_0_15px_rgba(0,0,0,0.05)] group">
            <div className="w-full h-full bg-[#eadef2] relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_100%,0_100%)] 
              lg:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.02] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-10 px-6 sm:px-10 md:px-16
              lg:pt-10 lg:pb-10 lg:pl-16 xl:pl-20 lg:pr-10 xl:pr-12"
            >
              {/* 3D Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/5 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/50 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-[2px] border-white mb-4 lg:mb-5 group-hover:-translate-y-2 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/80 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-[#491c68] drop-shadow-sm relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="font-black text-2xl lg:text-3xl text-[#491c68] mb-2 lg:mb-3 drop-shadow-sm tracking-tight">Solutif Aktif</h3>
                <p className="text-[#491c68]/90 text-sm lg:text-base leading-relaxed font-medium drop-shadow-sm max-w-sm">Setiap orang bisa menangani dan mengatasi masalah secara aktif dan solutif.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. KENAPA EMPATHIKA HADIR? (Editorial Magazine Layout) */}
      {/* ================================================================= */}
      <section className="w-full py-24 lg:py-32 bg-[#fbfbfb]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left: 3D Single Photo Layout */}
            <div 
              className="lg:w-1/2 w-full relative h-[400px] md:h-[550px] flex items-center justify-center group"
              style={{ perspective: '1200px' }}
            >
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#561269]/15 blur-[80px] rounded-full z-0 transition-colors duration-700 group-hover:bg-[#d97706]/15"></div>

              {/* 3D Photo Container */}
              <div 
                className="relative w-[80%] h-[85%] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out z-10 border-[8px] border-white group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)] group-hover:-translate-y-2 group-hover:rotate-1"
              >
                 <div className="absolute inset-0 rounded-[2rem] overflow-hidden bg-gray-100">
                   <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" alt="Empathika Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                   {/* Glass glare effect for 3D realism */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent opacity-40 mix-blend-overlay"></div>
                 </div>
              </div>
            </div>

            {/* Right: Typography Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#561269] mb-8 leading-tight">
                Kenapa Empathika<br />Hadir?
              </h2>
              <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light">
                <p>
                  Sering kali, mencari bantuan psikologis bukanlah hal yang mudah. Rasa takut, stigma, keterbatasan akses, hingga kekhawatiran untuk bercerita membuat banyak orang memilih menyimpan semuanya sendiri.
                </p>
                <p>
                  Empathika hadir dari kepedulian terhadap hal tersebut. Kami ingin menciptakan ruang yang terasa aman, nyaman, dan terbuka bagi siapa pun untuk mulai memahami dirinya dan mendapatkan bantuan yang dibutuhkan.
                </p>
                <p>
                  Dengan memanfaatkan teknologi, Empathika menghadirkan layanan psikologi yang lebih mudah dijangkau dan dekat dengan keseharian. Karena mendapatkan bantuan seharusnya tidak terasa rumit, dan setiap orang berhak memiliki ruang untuk didengarkan.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. ADA UNTUK SETIAP LANGKAHMU (Modern Clean Cards Grid) */}
      {/* ================================================================= */}
      <section className="w-full py-16 lg:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#561269] mb-6">Ada untuk Setiap Langkahmu</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
              Kami menyediakan beragam layanan yang dirancang secara khusus untuk memenuhi setiap fase perkembangan dan kebutuhan psikologismu.
            </p>
          </div>

          {/* Dynamic Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto mt-10 md:mt-12">
            
            {/* 1. Konsultasi (Span 2) - Dark Theme */}
            <div className="md:col-span-2 bg-[#491c68] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md text-white flex items-center justify-center mb-6 border border-white/20 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <div className="relative z-10">
                <h3 className="font-extrabold text-3xl text-white mb-3 tracking-tight">Konsultasi</h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed font-light max-w-lg">Ruang untuk berbicara bersama psikolog profesional mengenai berbagai hal yang sedang kamu hadapi dan menemukan langkah yang sesuai dengan kebutuhanmu.</p>
              </div>
            </div>

            {/* 2. Psikotes (Span 1) - Orange Glass Theme */}
            <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-[#fff7f0] to-[#ffe8d6] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-orange-100">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-[#d97706]/10 text-[#d97706] flex items-center justify-center mb-auto border border-[#d97706]/20 group-hover:bg-[#d97706] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-[#d97706] mb-3 tracking-tight">Psikotes</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">Tes psikologi untuk membantu mengenali potensi, kepribadian, minat, dan aspek diri lainnya dengan cara yang praktis dan terarah.</p>
              </div>
            </div>

            {/* 3. Pelatihan Peer Helper (Span 1) - Soft Purple Theme */}
            <div className="md:col-span-1 lg:col-span-1 bg-[#f9f5fa] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-[#cdb1db]/40">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-[#8e4a9e]/10 text-[#8e4a9e] flex items-center justify-center mb-auto border border-[#8e4a9e]/20 group-hover:bg-[#8e4a9e] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-[#8e4a9e] mb-3 tracking-tight leading-tight">Pelatihan Peer Helper</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">Membekali individu dengan keterampilan mendengar aktif dan mendampingi orang di sekitarnya sebagai bentuk dukungan awal.</p>
              </div>
            </div>

            {/* 4. Asesmen (Span 1) - Dark Green Theme */}
            <div className="md:col-span-1 lg:col-span-1 bg-[#1c352d] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-white/10 text-white flex items-center justify-center mb-auto border border-white/20 group-hover:bg-white group-hover:text-[#1c352d] transition-colors duration-300 relative z-10">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="font-extrabold text-2xl text-white mb-3 tracking-tight">Asesmen</h3>
                <p className="text-white/80 text-sm leading-relaxed font-light">Proses evaluasi untuk memahami kondisi dan karakteristik psikologis sebagai dasar dalam menentukan langkah atau kebutuhan selanjutnya.</p>
              </div>
            </div>

            {/* 5. Workshop / Seminar (Span 1) - Clean White Theme */}
            <div className="md:col-span-2 lg:col-span-1 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-gray-100">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-gray-50 text-gray-800 flex items-center justify-center mb-auto border border-gray-100 group-hover:bg-gray-800 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-gray-800 mb-3 tracking-tight">Workshop</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">Ruang belajar interaktif untuk memahami berbagai isu kesehatan mental bersama psikolog dan tenaga profesional.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. CLOSING CTA (Warm & Direct) */}
      {/* ================================================================= */}
      <CtaSection />

    </div>
  )
}
