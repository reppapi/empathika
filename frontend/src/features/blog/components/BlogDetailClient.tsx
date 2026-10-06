'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import { getBlogPost, BLOG_POSTS } from '@/features/blog/data/blogData';
import styles from './BlogDetail.module.css';

interface Props {
  slug: string;
}

export default function BlogDetailClient({ slug }: Props) {
  const post = getBlogPost(slug);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) {
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

  const recentPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  const recentEmoji = (cat?: string) => emojiMap[cat ?? ''] ?? '🖼️';

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
          {/* Author */}
          <div className={styles.authorRow}>
            <div className={styles.authorAvD}>{initials}</div>
            <span className={styles.authorMetaD}>
              <strong>{post.author.name}</strong>
              {' · '}
              {post.date}
              {' · '}
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className={styles.articleTitle}>{post.title}</h1>

          {/* Image */}
          <div className={styles.articleImg}>
            <div className={styles.articleImgIcon}>
              {recentEmoji(post.category)}
            </div>
          </div>

          {/* Body */}
          <div className={styles.articleBody}>
            {post.content.map((para, i) => (
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

          <hr className={styles.divider} />

          {/* Footer */}
          <div className={styles.articleFooter}>
            <span className={styles.viewsCount}>
              <Eye size={14} />
              {post.views} Tampilan
            </span>
            <button
              className={`${styles.likeBtn}${liked ? ` ${styles.liked}` : ''}`}
              onClick={() => setLiked((v) => !v)}
              aria-label={liked ? 'Batalkan suka' : 'Suka artikel ini'}
            >
              <Heart
                size={20}
                fill={liked ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Recent posts */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h3>Postingan Terkhir</h3>
            <Link href="/blog">Lihat Semua</Link>
          </div>
          <div className={styles.recentGrid}>
            {recentPosts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.recentCard}>
                <div className={styles.recentCardImg}>
                  {recentEmoji(p.category)}
                </div>
                <div className={styles.recentCardBody}>
                  <p className={styles.recentCardTitle}>{p.title}</p>
                  <div className={styles.recentCardMeta}>
                    <span><Eye size={11} /> {p.views}</span>
                    <span><Heart size={11} /> {p.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
