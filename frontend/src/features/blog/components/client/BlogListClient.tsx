'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import { BackendBlogItem } from '@/features/blog/types';
import { BLOG_CONSTANTS } from '@/features/blog/constants/blogConstants';
import { formatBlogDate, createExcerpt } from '@/features/blog/utils/blogUtils';
import styles from './BlogList.module.css';

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
        limit: BLOG_CONSTANTS.PUBLIC_POSTS_PER_PAGE,
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
              aria-label="Cari artikel"
            >
              <Search size={18} />
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
              const formattedDate = formatBlogDate(post.tanggal_terbit);
              const excerpt = createExcerpt(post.isi);

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={styles.blogCardLink}
                >
                  <div className={styles.blogCard}>
                    {post.banner_url && (
                      <div className={styles.blogCardImg}>
                        <Image
                          src={post.banner_url}
                          alt={post.judul}
                          fill
                          className="object-cover"
                          unoptimized
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
            <p className="text-sm font-medium text-gray-500">
              {searchQuery
                ? `Tidak ada artikel yang cocok dengan "${searchQuery}".`
                : 'Belum ada artikel.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pgBtn}
              disabled={page === 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.pgBtn}${page === i + 1 ? ` ${styles.active}` : ''}`}
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              className={styles.pgBtn}
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
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
