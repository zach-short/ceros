export interface Message {
  id: string;
  type: 'dm' | 'group' | 'motion' | 'system' | 'reply';
  senderId: string;
  content: string;
  roomId: string;
  timestamp: string;
  parentMessageId?: string;
  threadCount?: number;
  motionId?: string;
  voteId?: string;
  metadata?: Record<string, any>;
}

export interface Motion {
  id: string;
  committeeId: string;
  moverId: string;
  seconderId?: string;
  title: string;
  description: string;
  status: 'proposed' | 'seconded' | 'open' | 'passed' | 'failed' | 'tabled';
  votes: Vote[];
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