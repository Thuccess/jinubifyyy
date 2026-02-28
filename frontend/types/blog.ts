export interface BlogPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  coverImage?: string;
  author: string;
  category: string;
  tags?: string[];
  date: string | Date;
  published?: boolean;
  status?: 'draft' | 'review' | 'published' | 'archived';
  featured?: boolean;
  views?: number;
  seo?: { title?: string; description?: string; keywords?: string[] };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BlogPostResponse {
  post: BlogPost;
}

export interface BlogQueryParams {
  search?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'date' | 'views' | 'title';
  order?: 'asc' | 'desc';
}
