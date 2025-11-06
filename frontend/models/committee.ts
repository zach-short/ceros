export interface Committee {
  id: string;
  name: string;
  description: string;
  type: string;
  picture?: string;
  ownerId: string;
  chairId: string;
  memberIds: string[];
  observerIds: string[];
  createdAt?: string;
  updatedAt?: string;
}
