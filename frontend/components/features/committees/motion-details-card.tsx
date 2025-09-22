'use client';

interface MotionDetailsCardProps {
  motion: any;
}

export function MotionDetailsCard({ motion }: MotionDetailsCardProps) {
  return (
    <div className='p-4 rounded-lg border'>
      <h2 className='font-medium mb-3'>Motion Details</h2>
      <p className='text-sm opacity-75 leading-relaxed'>
        {motion.description}
      </p>
    </div>
  );
}