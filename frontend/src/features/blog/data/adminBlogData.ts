import { BlogPost } from "@/features/blog/types"
import { BLOG_POSTS } from "@/features/blog/data/blogData"

// Inisialisasi initial blogs dari dummy BLOG_POSTS
export const INITIAL_ADMIN_BLOGS: BlogPost[] = [...BLOG_POSTS]
