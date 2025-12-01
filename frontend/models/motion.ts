export type VoteThreshold = 'simple_majority' | 'two_thirds' | 'unanimous';

export interface VoteTally {
  aye_count: number;
  nay_count: number;
  abstain_count: number;
  total_eligible: number;
  quorum_met: boolean;
  passed?: boolean;
  tallied_at?: string;
}

export interface Motion {
  id: string;
  committeeId: string;
  moverId: string;
  seconderId?: string;
  title: string;
  description: string;
  status: 'proposed' | 'seconded' | 'open' | 'passed' | 'failed' | 'tabled';
  vote_threshold: VoteThreshold;
  requires_quorum: boolean;
  votes: Vote[];
  vote_tally?: VoteTally;
  createdAt: string;
  updatedAt: string;
  votingEndsAt?: string;
}

export interface Vote {
  id: string;
  motionId: string;
  userId: string;
  result: 'aye' | 'nay' | 'abstain';
  createdAt: string;
}