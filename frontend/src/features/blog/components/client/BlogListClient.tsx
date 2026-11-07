/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import { BackendBlogItem } from '@/features/blog/types';
import styles from './BlogList.module.css';

const POSTS_PER_PAGE = 4;

export default function BlogListClient() {
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState<BackendBlogItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    blogService
      .getList({
        page,
        limit: POSTS_PER_PAGE,
        search: searchQuery.trim() || undefined,
      })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setBlogs(res.data);
          setTotalPages(res.meta?.totalPages || 1);
        } else {
          setBlogs([]);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBlogs([]);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, searchQuery]);

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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <button
                className={styles.searchBtn}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  setPage(1);
                }}
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

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-purple-700 font-medium">
            Memuat artikel...
          </div>
        ) : blogs.length > 0 ? (
          <div className={styles.cardList}>
            {blogs.map((post) => {
              const formattedDate = new Date(post.tanggal_terbit).toLocaleDateString(
                'id-ID',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              );
              const excerpt =
                post.isi.length > 150
                  ? `${post.isi.substring(0, 150)}...`
                  : post.isi;

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={styles.blogCardLink}
                >
                  <div className={styles.blogCard}>
                    {post.banner_url && (
                      <div className={styles.blogCardImg}>
                        <img
                          src={post.banner_url}
                          alt={post.judul}
                          className={styles.cardImg}
                        />
                      </div>
                    )}

                    <div className={styles.blogCardBody}>
                      <div className={styles.cardAuthor}>
                        <p className={styles.authorDate}>{formattedDate}</p>
                      </div>

                      <h2 className={styles.cardTitle}>{post.judul}</h2>
                      <p className={styles.cardExcerpt}>{excerpt}</p>

                      <div className={styles.cardFooter}>
                        <div className={styles.cardFooterRight}>
                          <span className={styles.readMoreLink}>
                            Lihat Selengkapnya
                            <ArrowRight size={14} className={styles.readMoreArrow} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div style={{ fontSize: 48 }}></div>
            <p>
              {searchQuery
                ? `Tidak ada artikel yang cocok dengan pencarian "${searchQuery}"`
                : 'Belum ada artikel blog yang diterbitkan.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
