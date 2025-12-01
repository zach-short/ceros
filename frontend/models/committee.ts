import { VoteThreshold } from './motion';

export interface VotingRules {
  quorum_percentage: number;
  default_threshold: VoteThreshold;
  allow_abstentions: boolean;
}

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
  voting_rules: VotingRules;
  createdAt?: string;
  updatedAt?: string;
}
