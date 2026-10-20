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