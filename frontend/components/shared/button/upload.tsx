'use client';

import { UploadButton } from '@/lib/uploadthing';
import { CameraIcon, PencilIcon } from 'lucide-react';

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
      <PencilIcon className='absolute text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none h-8 w-8 z-10' />
    </div>
  );
}
