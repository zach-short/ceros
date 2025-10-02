'use client';

import { UploadButton } from '@/lib/uploadthing';
import { PencilIcon } from 'lucide-react';

export function UploadImageButton({
  onClientUploadComplete,
  onUploadError,
}: {
  onClientUploadComplete: (res: any) => void;
  onUploadError: (error: Error) => void;
}) {
  return (
    <div className='relative'>
      <UploadButton
        endpoint='imageUploader'
        onClientUploadComplete={(res) => onClientUploadComplete(res)}
        onUploadError={(error: Error) => onUploadError(error)}
        className='[&>*]:text-transparent [&>*]:bg-transparent'
        content={{
          button: '',
          allowedContent: '',
        }}
      />
      <PencilIcon className='absolute text-white bottom-3 left-1/3 transform   pointer-events-none h-4 w-4 sm:h-6 sm:w-6 z-10' />
    </div>
  );
}
