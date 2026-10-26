import { blogService } from '@/services/blog.service';
import { BackendBlogItem, BlogPost } from '../types';

// Dummy lokal dikosongkan; data artikel diambil dari backend.
export const BLOG_POSTS: BlogPost[] = [];

function excerptFromIsi(isi: string): string {
  const plain = isi.replace(/\s+/g, ' ').trim();
  return plain.length > 150 ? `${plain.substring(0, 150)}...` : plain;
}

function mapBackendToPost(item: BackendBlogItem): BlogPost {
  return {
    id: item.id,
    slug: item.id,
    title: item.judul,
    excerpt: excerptFromIsi(item.isi),
    content: item.isi.split('\n').filter((p) => p.trim() !== ''),
    date: item.tanggal_terbit,
    imageUrl: item.banner_url ?? undefined,
  };
}

export async function getBlogPost(idOrSlug: string): Promise<BlogPost | undefined> {
  try {
    const res = await blogService.getById(idOrSlug);
    if (res?.success && res.data) {
      return mapBackendToPost(res.data);
    }
  } catch {
    return undefined;
  }
  return undefined;
}
