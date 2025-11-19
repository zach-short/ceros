'use client';

interface MotionSubmotionsProps {
  motion: any;
}

export function MotionSubmotions({ motion }: MotionSubmotionsProps) {
  if (motion.submotions.length === 0) {
    return null;
  }

  return (
    <div className='p-4 rounded-lg border'>
      <h2 className='font-medium mb-3'>Amendments & Submotions</h2>
      <div className='space-y-2'>
        {motion.submotions.map((submotion: any) => (
          <div
            key={submotion.id}
            className='p-3 rounded border bg-accent/50'
          >
            <div className='flex justify-between items-start'>
              <p className='text-sm font-medium'>{submotion.title}</p>
              <span className='text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900'>
                {submotion.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}