import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    full_name: string;
    avatar_url: string;
  };
  tags: {
    tag: {
      name: string;
      slug: string;
    };
  }[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export function useBlogPosts(category?: string, searchTerm?: string) {
  return useQuery({
    queryKey: ['blog', 'posts', category, searchTerm],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (searchTerm) params.search = searchTerm;
      
      const data = await fetchApi<BlogPost[]>('/blog/posts', { params });
      return data;
    },
  });
}

export function useRecentPosts(limit = 3) {
  return useQuery({
    queryKey: ['blog', 'recent', limit],
    queryFn: async () => {
      return await fetchApi<BlogPost[]>('/blog/posts/recent', { params: { limit } });
    },
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        return await fetchApi<BlogPost>(`/blog/posts/${slug}`);
      } catch (error: any) {
        if (error.message.includes('404')) return null;
        throw error;
      }
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog', 'categories'],
    queryFn: async () => {
      return await fetchApi<BlogCategory[]>('/blog/categories');
    },
  });
}
