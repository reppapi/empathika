import React from 'react';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { BlogPost } from '../types';

export default function RecentBlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '12px',
        borderRadius: '12px',
        background: 'rgba(124,58,237,0.04)',
        border: '1px solid rgba(124,58,237,0.08)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.2s ease',
      }}
    >
      {/* Mini thumbnail */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed22, #7c3aed44)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}
      >
        🧠
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1a0533',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </p>
        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#a09abd' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Eye size={10} /> {post.views.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Heart size={10} /> {post.likes}
          </span>
        </div>
      </div>
    </Link>
  );
}