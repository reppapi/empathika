export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  author: {
    name: string;
    avatar?: string;
  };
  category?: string;
  tags?: string[];
  date: string;
  readTime: string;
  views: number;
  likes: number;
  imageUrl?: string;
}