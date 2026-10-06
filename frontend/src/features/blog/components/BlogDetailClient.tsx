'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import { getBlogPost, BLOG_POSTS } from '@/features/blog/data/blogData';

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
    <>
      <style>{`
        * { box-sizing: border-box; }

        /* push ALL content below fixed navbar */
        .detail-page {
          padding-top: 110px;
          background: #f8f5ff;
          min-height: 100vh;
          width: 100%;
          padding-bottom: 64px;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 768px) {
          .detail-page { padding-left: 16px; padding-right: 16px; padding-top: 90px; }
        }

        /* Center column — allow generous width but not edge-to-edge for readability */
        .detail-col {
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
        }

        /* Back link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #9ca3af;
          text-decoration: none;
          margin-bottom: 20px;
          font-weight: 500;
          transition: color 0.15s;
          padding: 4px 0;
        }
        .back-link:hover { color: #7c3aed; }

        /* Article card */
        .article-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #ede9fe;
          box-shadow: 0 4px 28px rgba(109,40,217,0.08);
          overflow: hidden;
          padding: 32px 36px;
        }
        @media (max-width: 640px) {
          .article-card { padding: 22px 18px; border-radius: 18px; }
        }

        /* Author row */
        .author-row {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }
        .author-av-d {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          color: white;
          flex-shrink: 0;
        }
        .author-meta-d {
          font-size: 13.5px;
          color: #6b7280;
          line-height: 1.5;
        }
        .author-meta-d strong { color: #1a0533; font-weight: 700; }

        /* Title */
        .article-title {
          font-size: clamp(22px, 3.5vw, 30px);
          font-weight: 900;
          color: #12002a;
          line-height: 1.28;
          margin: 0 0 26px;
        }

        /* Image placeholder */
        .article-img {
          width: 100%;
          height: 260px;
          background: linear-gradient(145deg, #ede9fe 0%, #ddd6fe 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }
        .article-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(124,58,237,0.04) 100%);
        }
        .article-img-icon {
          width: 90px; height: 90px;
          background: rgba(255,255,255,0.6);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.12);
        }
        @media (max-width: 540px) {
          .article-img { height: 180px; }
          .article-img-icon { width: 70px; height: 70px; font-size: 34px; }
        }

        /* Body text */
        .article-body p {
          font-size: 15.5px;
          color: #374151;
          line-height: 1.9;
          margin: 0 0 20px;
        }
        .article-body p:last-child { margin-bottom: 0; }

        .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }

        /* Share */
        .share-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .share-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }
        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .copy-btn:hover { border-color: #7c3aed; color: #7c3aed; background: rgba(124,58,237,0.04); }
        .copy-btn.copied { border-color: #059669; color: #059669; background: rgba(5,150,105,0.05); }

        /* Footer */
        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .views-count {
          font-size: 13px;
          color: #a09abd;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .like-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.15s, transform 0.15s;
          font-family: inherit;
          padding: 4px;
        }
        .like-btn.liked { color: #ec4899; }
        .like-btn:hover { color: #ec4899; transform: scale(1.1); }

        /* ── Recent posts ── */
        .recent-section { margin-top: 36px; }
        .recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .recent-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          color: #12002a;
        }
        .recent-header a {
          font-size: 13px;
          font-weight: 600;
          color: #7c3aed;
          text-decoration: none;
        }
        .recent-header a:hover { text-decoration: underline; }

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .recent-grid { grid-template-columns: 1fr; }
        }

        .recent-card {
          display: block;
          text-decoration: none;
          color: inherit;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #ede9fe;
          box-shadow: 0 2px 12px rgba(109,40,217,0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .recent-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(109,40,217,0.13);
        }
        .recent-card-img {
          width: 100%;
          height: 110px;
          background: linear-gradient(145deg, #ede9fe 0%, #ddd6fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
        }
        .recent-card-body { padding: 12px 14px; }
        .recent-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #12002a;
          line-height: 1.4;
          margin: 0 0 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .recent-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11.5px;
          color: #a09abd;
        }
        .recent-card-meta span {
          display: flex;
          align-items: center;
          gap: 3px;
        }
      `}</style>

      <div className="detail-page">
        <div className="detail-col">
          {/* Back */}
          <Link href="/blog" className="back-link">
            <ChevronLeft size={15} />
            All Posts
          </Link>

          {/* Article */}
          <div className="article-card">
            {/* Author */}
            <div className="author-row">
              <div className="author-av-d">{initials}</div>
              <span className="author-meta-d">
                <strong>{post.author.name}</strong>
                {' · '}
                {post.date}
                {' · '}
                {post.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="article-title">{post.title}</h1>

            {/* Image */}
            <div className="article-img">
              <div className="article-img-icon">
                {recentEmoji(post.category)}
              </div>
            </div>

            {/* Body */}
            <div className="article-body">
              {post.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <hr className="divider" />

            {/* Share */}
            <div className="share-row">
              <span className="share-label">Bagikan Artikel ini</span>
              <button
                className={`copy-btn${copied ? ' copied' : ''}`}
                onClick={handleCopy}
              >
                <LinkIcon size={14} />
                {copied ? '✓ Tautan disalin!' : 'Salin tautan'}
              </button>
            </div>

            <hr className="divider" />

            {/* Footer */}
            <div className="article-footer">
              <span className="views-count">
                <Eye size={14} />
                {post.views} Tampilan
              </span>
              <button
                className={`like-btn${liked ? ' liked' : ''}`}
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
          <div className="recent-section">
            <div className="recent-header">
              <h3>Postingan Terkhir</h3>
              <Link href="/blog">Lihat Semua</Link>
            </div>
            <div className="recent-grid">
              {recentPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="recent-card">
                  <div className="recent-card-img">
                    {recentEmoji(p.category)}
                  </div>
                  <div className="recent-card-body">
                    <p className="recent-card-title">{p.title}</p>
                    <div className="recent-card-meta">
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
    </>
  );
}
