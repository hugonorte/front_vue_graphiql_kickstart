export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lastLogin?: string | null;
}