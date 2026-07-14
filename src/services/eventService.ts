import { Event } from '@/types'
import { events } from '@/data/events'

export const eventService = {
  async getAll(): Promise<Event[]> {
    return events;
  },

  async getById(id: string): Promise<Event | null> {
    const event = events.find((e) => e.id === id);
    return event || null;
  },

  async getUpcoming(): Promise<Event[]> {
    const now = new Date();
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  async getPast(): Promise<Event[]> {
    const now = new Date();
    return events
      .filter((e) => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getByCategory(category: string): Promise<Event[]> {
    return events.filter((e) => e.category === category);
  },
}
