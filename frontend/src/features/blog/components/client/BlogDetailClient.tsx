/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, ChevronLeft } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import { BackendBlogItem } from '@/features/blog/types';
import styles from './BlogDetail.module.css';

interface Props {
  slug: string;
}

export default function BlogDetailClient({ slug }: Props) {
  const [blog, setBlog] = useState<BackendBlogItem | null>(null);
  const [recentPosts, setRecentPosts] = useState<BackendBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      blogService.getById(slug).catch(() => null),
      blogService.getList({ page: 1, limit: 3 }).catch(() => null),
    ])
      .then(([detailRes, listRes]) => {
        if (!isMounted) return;
        if (detailRes?.success && detailRes.data) {
          setBlog(detailRes.data);
          document.title = `${detailRes.data.judul} – Blog Empathika`;
        } else {
          setBlog(null);
          document.title = 'Artikel Tidak Ditemukan – Empathika';
        }

        if (listRes?.success && Array.isArray(listRes.data)) {
          setRecentPosts(listRes.data.filter((p: BackendBlogItem) => p.id !== slug).slice(0, 3));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{
        paddingTop: 130, minHeight: '100vh', background: '#f8f5ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: '#7c3aed', textAlign: 'center',
      }}>
        <p style={{ fontWeight: 600, fontSize: 16 }}>Memuat detail artikel...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{
        paddingTop: 130, minHeight: '100vh', background: '#f8f5ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: '#7c3aed', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56 }}>😔</div>
        <p style={{ fontWeight: 700, fontSize: 18, color: '#1a0533' }}>Artikel tidak ditemukan</p>
        <Link href="/blog" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
          ← Kembali ke Blog
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.tanggal_terbit).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const paragraphs = blog.isi.split('\n').filter((p) => p.trim() !== '');

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailCol}>
        {/* Back */}
        <Link href="/blog" className={styles.backLink}>
          <ChevronLeft size={15} />
          All Posts
        </Link>

        {/* Article */}
        <div className={styles.articleCard}>
          {/* Date */}
          <div className={styles.authorRow}>
            <span className={styles.authorMetaD}>{formattedDate}</span>
          </div>

          {/* Title */}
          <h1 className={styles.articleTitle}>{blog.judul}</h1>

          {/* Image */}
          {blog.banner_url && (
            <div className={styles.articleImg}>
              <img
                src={blog.banner_url}
                alt={blog.judul}
                className={styles.articleCoverImg}
              />
            </div>
          )}

          {/* Body */}
          <div className={styles.articleBody}>
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <hr className={styles.divider} />

          {/* Share */}
          <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Bagikan Artikel ini</span>
            <button
              className={`${styles.copyBtn}${copied ? ` ${styles.copied}` : ''}`}
              onClick={handleCopy}
            >
              <LinkIcon size={14} />
              {copied ? '✓ Tautan disalin!' : 'Salin tautan'}
            </button>
          </div>
        </div>

        {/* Recent posts */}
        {recentPosts.length > 0 && (
          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <h3>Postingan Terakhir</h3>
              <Link href="/blog">Lihat Semua</Link>
            </div>
            <div className={styles.recentGrid}>
              {recentPosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.id}`} className={styles.recentCard}>
                  {p.banner_url && (
                    <div className={styles.recentCardImg}>
                      <img src={p.banner_url} alt={p.judul} className={styles.recentThumb} />
                    </div>
                  )}
                  <div className={styles.recentCardBody}>
                    <p className={styles.recentCardTitle}>{p.judul}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
