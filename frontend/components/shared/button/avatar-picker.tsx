'use client';

import { useState } from 'react';
import { PRESET_AVATARS } from '@/lib/constants/avatars';
import { UploadButton } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { PencilIcon, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarPickerProps {
  onSelect: (url: string) => void;
  onUploadError?: (error: Error) => void;
  currentAvatar?: string;
}

export function AvatarPicker({
  onSelect,
  onUploadError,
  currentAvatar,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetSelect = (avatar: string) => {
    setSelectedPreset(avatar);
    onSelect(avatar);
    setOpen(false);
  };

  const handleUploadComplete = (res: any) => {
    onSelect(res[0].url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90'
        >
          <PencilIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Choose Profile Picture</DialogTitle>
          <DialogDescription>
            Select a preset avatar or upload your own image
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue='presets' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='presets'>
              <ImageIcon className='mr-2 h-4 w-4' />
              Preset Avatars
            </TabsTrigger>
            <TabsTrigger value='upload'>
              <Upload className='mr-2 h-4 w-4' />
              Upload Custom
            </TabsTrigger>
          </TabsList>
          <TabsContent value='presets' className='mt-4'>
            <div className='grid grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-4 max-h-[400px] overflow-y-auto p-2'>
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={avatar}
                  onClick={() => handlePresetSelect(avatar)}
                  className={cn(
                    'relative rounded-full sm:h-20 sm:w-20 w-12 h-12 transition-all hover:ring-2 hover:ring-primary',
                    selectedPreset === avatar && 'ring-2 ring-primary',
                    currentAvatar === avatar && 'ring-2 ring-primary',
                  )}
                >
                  <Avatar className='sm:h-20 sm:w-20 w-12 h-12'>
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                  </Avatar>
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value='upload' className='mt-4'>
            <div className='flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-lg'>
              <Upload className='h-12 w-12 text-muted-foreground' />
              <div className='text-center'>
                <p className='text-sm font-medium'>Upload your own image</p>
              </div>
              <UploadButton
                endpoint='imageUploader'
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error: Error) => {
                  onUploadError?.(error);
                }}
                appearance={{
                  button:
                    'text-primary-foreground bg-blue-700 px-4 ut-ready:bg-primary ut-uploading:bg-primary/50',
                  allowedContent: 'hidden',
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
