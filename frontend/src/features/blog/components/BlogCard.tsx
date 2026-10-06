import React from 'react';
import Link from 'next/link';
import { Heart, Eye, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  'Pemahaman Diri': '#7c3aed',
  'Kesehatan Mental': '#0891b2',
  'Pemuda & Identitas': '#d97706',
  'Praktik Sehari-hari': '#059669',
  'Hubungan': '#db2777',
  'default': '#6b7280',
};

export default function BlogCard({ post }: { post: BlogPost }) {
  const categoryColor = CATEGORY_COLORS[post.category ?? 'default'] ?? CATEGORY_COLORS['default'];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f0eaf7',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Gradient Image Placeholder */}
      <div
        style={{
          height: '180px',
          background: `linear-gradient(135deg, ${categoryColor}22 0%, ${categoryColor}44 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `${categoryColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}
        >
          🧠
        </div>
        {post.category && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: categoryColor,
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.02em',
            }}
          >
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {/* Author & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8b7aa8' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {post.author.name.charAt(0)}
          </div>
          <span style={{ fontWeight: 500 }}>{post.author.name}</span>
          <span>·</span>
          <span>{post.date}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#1a0533',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#6b5b8d',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.excerpt}
        </p>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid #f5f0fb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#a09abd' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={12} />
              {post.views.toLocaleString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={12} />
              {post.likes}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {post.readTime}
            </span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: categoryColor, fontWeight: 600 }}>
            Baca <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}