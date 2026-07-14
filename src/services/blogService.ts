import { Blog } from '@/types'
import { blogs } from '@/data/blogs'

export const blogService = {
  async getAll(): Promise<Blog[]> {
    return blogs;
  },

  async getById(id: string): Promise<Blog | null> {
    const blog = blogs.find((b) => b.id === id);
    return blog || null;
  },

  async getLatest(limit = 6): Promise<Blog[]> {
    return [...blogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  async getByTag(tag: string): Promise<Blog[]> {
    return blogs.filter((b) => b.tags?.includes(tag));
  },

  async getByCategory(category: string): Promise<Blog[]> {
    return blogs.filter((b) => b.category === category);
  },

  async search(query: string): Promise<Blog[]> {
    const lowerQuery = query.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.content.toLowerCase().includes(lowerQuery) ||
        b.author.toLowerCase().includes(lowerQuery)
    );
  },
}
