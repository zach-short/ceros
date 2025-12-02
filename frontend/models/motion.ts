export type VoteThreshold = 'simple_majority' | 'two_thirds' | 'unanimous';
export type MotionType = 'main' | 'to_table';

export interface VoteTally {
  aye_count: number;
  nay_count: number;
  abstain_count: number;
  total_eligible: number;
  quorum_met: boolean;
  passed?: boolean;
  tallied_at?: string;
}

export interface DiscussionEntry {
  message_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Motion {
  id: string;
  committee_id: string;
  mover_id: string;
  seconder_id?: string;
  title: string;
  description: string;
  status: 'proposed' | 'seconded' | 'open' | 'passed' | 'failed' | 'tabled';
  vote_threshold: VoteThreshold;
  requires_quorum: boolean;
  votes: Vote[];
  vote_tally?: VoteTally;
  discussion?: DiscussionEntry[];
  summary?: string;
  motion_type: MotionType;
  parent_motion_id?: string;
  created_at: string;
  updated_at: string;
  voting_ends_at?: string;
}

export interface Vote {
  id: string;
  motion_id: string;
  user_id: string;
  result: 'aye' | 'nay' | 'abstain';
  created_at: string;
}