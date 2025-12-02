'use client';

import { Motion } from '@/models/motion';

interface MotionSubmotionsProps {
  motion: Motion;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MotionSubmotions({ motion: _motion }: MotionSubmotionsProps) {
  // Submotions are separate Motion records with parent_motion_id
  // For now, we'll just return null since we don't fetch submotions separately
  // TODO: Fetch and display submotions using motion.id as parent_motion_id
  return null;
}