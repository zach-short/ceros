export interface Committee {
  id: string;
  name: string;
  description: string;
  type: string;
  ownerId: string;
  chairId: string;
  memberIds: string[];
  observerIds: string[];
}
