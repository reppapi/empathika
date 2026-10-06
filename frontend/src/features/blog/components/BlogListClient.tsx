'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BLOG_POSTS } from '@/features/blog/data/blogData';

const POSTS_PER_PAGE = 4;

export default function BlogListClient() {
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery.trim()
    ? BLOG_POSTS.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : BLOG_POSTS;

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        /* ── Hero ── */
        .blog-hero {
          width: 100%;
          /* push below fixed navbar (~90px on desktop) */
          padding-top: 130px;
          padding-bottom: 70px;
          padding-left: 24px;
          padding-right: 24px;
          text-align: center;
          background: linear-gradient(160deg, #3b006e 0%, #6d28d9 55%, #9333ea 100%);
          position: relative;
          overflow: hidden;
        }
        .blog-hero::before {
          content: '';
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%);
          top: -100px; right: -100px;
        }
        .blog-hero::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          bottom: -60px; left: -60px;
        }
        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 900;
          color: white;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 18px;
          line-height: 1.1;
        }
        .hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.78);
          line-height: 1.75;
          margin: 0;
        }

        /* ── Page body ── */
        .blog-body {
          background: #f8f5ff;
          min-height: calc(100vh - 90px);
          padding: 32px 40px 64px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .blog-body { padding: 24px 16px 48px; }
        }

        /* ── Search bar ── */
        .search-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 28px;
          gap: 12px;
        }
        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1.5px solid #e9e0ff;
          border-radius: 100px;
          padding: 9px 18px;
          flex: 1;
          max-width: 380px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .search-input-wrap input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #1a0533;
          flex: 1;
          font-family: inherit;
        }
        .search-input-wrap input::placeholder { color: #c4b5fd; }
        .search-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 50%;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .search-btn:hover { background: rgba(124,58,237,0.1); }

        /* ── Card list ── */
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        /* ── Blog card ── */
        .blog-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          width: 100%;
        }
        .blog-card {
          display: flex;
          width: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 20px rgba(109,40,217,0.07);
          border: 1px solid #ede9fe;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .blog-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 36px rgba(109,40,217,0.14);
        }

        /* Image side */
        .blog-card-img {
          width: 220px;
          flex-shrink: 0;
          background: linear-gradient(145deg, #ede9fe 0%, #ddd6fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          position: relative;
        }
        @media (max-width: 640px) {
          .blog-card { flex-direction: column; }
          .blog-card-img { width: 100%; height: 150px; min-height: unset; }
        }
        .img-frame {
          width: 80px; height: 80px;
          border-radius: 16px;
          background: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          box-shadow: 0 4px 16px rgba(109,40,217,0.1);
        }

        /* Text side */
        .blog-card-body {
          flex: 1;
          padding: 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        /* Author */
        .card-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .author-av {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: white;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .author-name {
          font-size: 14px;
          font-weight: 700;
          color: #1a0533;
          margin: 0;
          line-height: 1.3;
        }
        .author-date {
          font-size: 12px;
          color: #a09abd;
          margin: 0;
        }

        /* Title */
        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #12002a;
          line-height: 1.35;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Excerpt */
        .card-excerpt {
          font-size: 13.5px;
          color: #6b5b8d;
          line-height: 1.7;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Footer */
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f5f0fb;
          margin-top: auto;
        }
        .card-views {
          font-size: 12.5px;
          color: #a09abd;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-like-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #d8c8f0;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s, transform 0.15s;
          line-height: 1;
        }
        .card-like-btn:hover {
          color: #ec4899;
          transform: scale(1.15);
        }

        /* ── Pagination ── */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
        }
        .pg-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          border: 1.5px solid #ede9fe;
          background: white;
          color: #7c3aed;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: inherit;
        }
        .pg-btn:hover:not(:disabled):not(.active) {
          background: #f5f0fb;
          border-color: #c4b5fd;
        }
        .pg-btn.active {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
          box-shadow: 0 3px 12px rgba(124,58,237,0.3);
        }
        .pg-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #a09abd;
        }
        .empty-state p { margin: 12px 0 0; font-size: 15px; }
      `}</style>

      {/* ── Hero (full width, clear of fixed navbar) ── */}
      <section className="blog-hero">
        <div className="hero-inner">
          <h1 className="hero-title">Sudut Refleksi</h1>
          <p className="hero-sub">
            Temukan cerita, wawasan, dan perspektif baru yang mungkin<br />
            sedang kamu butuhkan hari ini.
          </p>
        </div>
      </section>

      {/* ── Content body (full width) ── */}
      <div className="blog-body">
        {/* Search row */}
        <div className="search-row">
          {searchOpen ? (
            <>
              <div className="search-input-wrap">
                <Search size={16} color="#a78bfa" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari artikel…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
              <button
                className="search-btn"
                onClick={() => { setSearchOpen(false); setSearchQuery(''); setPage(1); }}
                aria-label="Tutup pencarian"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              className="search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Buka pencarian"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Card list */}
        {paginated.length > 0 ? (
          <div className="card-list">
            {paginated.map((post) => {
              const initials = post.author.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('');

              const emojiMap: Record<string, string> = {
                'Pemahaman Diri': '🪞',
                'Kesehatan Mental': '🧘',
                'Pemuda & Identitas': '🌱',
                'Praktik Sehari-hari': '☀️',
                'Hubungan': '💞',
              };
              const emoji = emojiMap[post.category ?? ''] ?? '🖼️';

              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card">
                    {/* Image */}
                    <div className="blog-card-img">
                      <div className="img-frame">{emoji}</div>
                    </div>

                    {/* Text */}
                    <div className="blog-card-body">
                      <div className="card-author">
                        <div className="author-av">{initials}</div>
                        <div>
                          <p className="author-name">{post.author.name}</p>
                          <p className="author-date">{post.date}</p>
                        </div>
                      </div>

                      <h2 className="card-title">{post.title}</h2>
                      <p className="card-excerpt">{post.excerpt}</p>

                      <div className="card-footer">
                        <span className="card-views">
                          <Eye size={14} />
                          {post.views} Tampilan
                        </span>
                        <button className="card-like-btn" aria-label="Suka">
                          <Heart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>🔍</div>
            <p>Tidak ada artikel yang cocok dengan pencarian <strong>"{searchQuery}"</strong></p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pg-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pg-btn${page === i + 1 ? ' active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pg-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
