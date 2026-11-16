import { blogService } from "@/services/blog.service"
import { BlogPost } from "../types"
import { mapBackendBlogToPost } from "../utils/blogUtils"

export async function getBlogPost(idOrSlug: string): Promise<BlogPost | undefined> {
  try {
    const res = await blogService.getById(idOrSlug)
    if (res?.success && res.data) {
      return mapBackendBlogToPost(res.data)
    }
  } catch {
    return undefined
  }
  return undefined
}
