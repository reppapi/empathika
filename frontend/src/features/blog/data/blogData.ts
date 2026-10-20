import { BlogPost } from '../types';

// Kosongkan dummy BLOG_POSTS agar data 100% murni berasal dari Backend Database
export const BLOG_POSTS: BlogPost[] = [];

export function getBlogPost(idOrSlug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}