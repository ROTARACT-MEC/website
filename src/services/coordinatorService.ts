import { Coordinator } from '@/types'
import { coordinators } from '@/data/coordinators'

export const coordinatorService = {
  async getAll(): Promise<Coordinator[]> {
    return coordinators;
  },

  async getById(id: string): Promise<Coordinator | null> {
    const coordinator = coordinators.find((c) => c.id === id);
    return coordinator || null;
  },

  async getByRole(role: string): Promise<Coordinator[]> {
    return coordinators.filter((c) => c.role === role);
  },
}
