import { Activity } from '@/types'
import { activities } from '@/data/activities'

export const activityService = {
  async getAll(): Promise<Activity[]> {
    return activities;
  },

  async getById(id: string): Promise<Activity | null> {
    const activity = activities.find((a) => a.id === id);
    return activity || null;
  },

  async getByCategory(category: string): Promise<Activity[]> {
    return activities.filter((a) => a.category === category);
  },

  async getRecent(limit = 6): Promise<Activity[]> {
    return [...activities]
      .sort((a, b) => {
        if (!a.date || !b.date) return 0
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .slice(0, limit);
  },
}
