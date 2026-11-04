import Image from "next/image"

interface GalleryItem {
  src: string
  alt: string
}

interface ProgramGalleryProps {
  images: GalleryItem[]
}

export function ProgramGallery({ images }: ProgramGalleryProps) {
  return (
    <section aria-label="Foto Kegiatan" className="w-full pt-4 pb-12 sm:pt-6 sm:pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 
          3 Foto Berjajar Sesuai Sketsa:
          - Teks 'Dokumentasi Kegiatan' sudah dihapus
          - Sudut foto kotak (rounded-none)
          - Jarak ke atas dipersempit agar tidak ada space kosong terlalu banyak
        */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-thin">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative shrink-0 w-[82vw] sm:w-[50vw] md:w-auto aspect-[4/3] rounded-none overflow-hidden bg-gray-100 shadow-sm border border-gray-200 snap-center group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 80vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
