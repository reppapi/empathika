import BlogListClient from '@/features/blog/components/client/BlogListClient';

export const metadata = {
  title: 'Sudut Refleksi – Blog Empathika',
  description:
    'Temukan cerita, wawasan, dan perspektif baru seputar kesehatan mental dari para psikolog profesional Empathika.',
};

export default function BlogPage() {
  return <BlogListClient />;
}