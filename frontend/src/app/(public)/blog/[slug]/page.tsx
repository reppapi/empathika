import { Metadata } from 'next';
import { getBlogPost } from '@/features/blog/data/blogData';
import BlogDetailClient from '@/features/blog/components/BlogDetailClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: 'Artikel Tidak Ditemukan – Empathika' };
  return {
    title: `${post.title} – Blog Empathika`,
    description: post.excerpt,
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  return <BlogDetailClient slug={params.slug} />;
}
