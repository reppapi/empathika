export interface BlogPost {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  category?: string;
  tags?: string[];
  date: string;
  readTime?: string;
  views?: number;
  likes?: number;
  imageUrl?: string;
}

export interface BackendBlogItem {
  id: string;
  judul: string;
  isi: string;
  banner_url: string | null;
  tanggal_terbit: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogListApiResponse {
  success: boolean;
  message: string;
  data: BackendBlogItem[];
  meta: BlogListMeta;
}

export interface BlogDetailApiResponse {
  success: boolean;
  message: string;
  data: BackendBlogItem;
}

export interface BlogMutationApiResponse {
  success: boolean;
  message: string;
  data: BackendBlogItem;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
