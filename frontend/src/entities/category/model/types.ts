export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}