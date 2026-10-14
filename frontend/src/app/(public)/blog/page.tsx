import BlogListClient from '@/features/blog/components/client/BlogListClient';

export const metadata = {
  title: 'Sudut Refleksi – Blog Empathika',
  description:
    'Temukan cerita, wawasan, dan perspektif baru seputar kesehatan mental dari para psikolog profesional Empathika.',
};

export default async function BlogPage() {
  // hanya untuk testing, uncomment kalau mau liat loading state nya
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  // hanya untuk testing, uncomment kalau mau liat error state nya
  // throw new Error('Ini contoh tampilan error page');

  return <BlogListClient />;
}