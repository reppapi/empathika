/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Heart, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '@/features/blog/data/blogData';
import styles from './BlogList.module.css';

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
    <div className="w-full">
      {/* ── Hero (full width, clear of fixed navbar) ── */}
      <section className={styles.blogHero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Sudut Refleksi</h1>
          <p className={styles.heroSub}>
            Temukan cerita, wawasan, dan perspektif baru yang mungkin<br />
            sedang kamu butuhkan hari ini.
          </p>
        </div>
      </section>

      {/* ── Content body (full width) ── */}
      <div className={styles.blogBody}>
        {/* Search row */}
        <div className={styles.searchRow}>
          {searchOpen ? (
            <>
              <div className={styles.searchInputWrap}>
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
                className={styles.searchBtn}
                onClick={() => { setSearchOpen(false); setSearchQuery(''); setPage(1); }}
                aria-label="Tutup pencarian"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              className={styles.searchBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Buka pencarian"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Card list */}
        {paginated.length > 0 ? (
          <div className={styles.cardList}>
            {paginated.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.blogCardLink}>
                  <div className={styles.blogCard}>
                    {/* Real Article Photo (No Emoji) */}
                    {post.imageUrl && (
                      <div className={styles.blogCardImg}>
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className={styles.cardImg}
                        />
                      </div>
                    )}

                    {/* Text */}
                    <div className={styles.blogCardBody}>
                      <div className={styles.cardAuthor}>
                        <p className={styles.authorDate}>{post.date}</p>
                        {post.category && (
                          <span className={styles.categoryBadge}>{post.category}</span>
                        )}
                      </div>

                      <h2 className={styles.cardTitle}>{post.title}</h2>
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>

                      <div className={styles.cardFooter}>
                        <span className={styles.cardViews}>
                          <Eye size={14} />
                          {post.views} Tampilan
                        </span>
                        <div className={styles.cardFooterRight}>
                          <span className={styles.readMoreLink}>
                            Lihat Selengkapnya
                            <ArrowRight size={14} className={styles.readMoreArrow} />
                          </span>
                          <div 
                            className={styles.cardLikeBtn} 
                            aria-label="Suka" 
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p>Tidak ada artikel yang cocok dengan pencarian <strong>&ldquo;{searchQuery}&rdquo;</strong></p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pgBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.pgBtn}${page === i + 1 ? ` ${styles.active}` : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className={styles.pgBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
