'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import Image from 'next/image';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  clickable?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}

function Avatar({
  className,
  clickable = false,
  imageSrc,
  imageAlt = 'Avatar',
  onClick,
  ...props
}: AvatarProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (clickable && imageSrc) {
      setIsModalOpen(true);
    }
    onClick?.(e);
  };

  return (
    <>
      <AvatarPrimitive.Root
        data-slot='avatar'
        className={cn(
          'relative flex size-4 shrink-0 overflow-hidden rounded-full',
          clickable &&
            imageSrc &&
            'cursor-pointer hover:opacity-80 transition-opacity',
          className,
        )}
        onClick={handleClick}
        {...props}
      />

      {isModalOpen && imageSrc && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 lg:bg-black/60'
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className='absolute top-4 left-4 lg:top-6 lg:left-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10'
            aria-label='Close'
          >
            <X className='w-6 h-6' />
          </button>

          <div
            className='relative w-full h-auto lg:max-w-4xl lg:max-h-[90vh] p-4 lg:p-0'
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={1200}
              className='w-full h-auto object-contain max-h-[90vh]'
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
