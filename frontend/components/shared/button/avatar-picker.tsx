'use client';

import { useState } from 'react';
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
import {
  PencilIcon,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const USER_DICEBEAR_STYLES = [
  { name: '', value: 'avataaars' },
  { name: '', value: 'big-smile' },
  { name: '', value: 'personas' },
  { name: '', value: 'lorelei' },
  { name: '', value: 'fun-emoji' },
  { name: '', value: 'adventurer' },
];

const COMMITTEE_DICEBEAR_STYLES = [
  { name: '', value: 'shapes' },
  { name: '', value: 'identicon' },
  { name: '', value: 'rings' },
  { name: '', value: 'pixel-art' },
  { name: '', value: 'bottts' },
  { name: '', value: 'thumbs' },
];

const generateDiceBearAvatar = (seed: string, style: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

const generateRandomSeed = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

interface AvatarPickerProps {
  type?: 'user' | 'committee';
  seed?: string;
  onSelect: (url: string) => void;
  onUploadError?: (error: Error) => void;
  currentAvatar?: string;
}

export function AvatarPicker({
  type = 'user',
  seed = 'default',
  onSelect,
  onUploadError,
  currentAvatar,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [currentSeed, setCurrentSeed] = useState(seed);

  const handlePresetSelect = (avatar: string) => {
    setSelectedPreset(avatar);
    onSelect(avatar);
    setOpen(false);
  };

  const handleUploadComplete = (res: any) => {
    onSelect(res[0].url);
    setOpen(false);
  };

  const handleRegenerate = () => {
    const newSeed = generateRandomSeed();
    setCurrentSeed(newSeed);
    setSelectedPreset(null);
  };

  const styles =
    type === 'user' ? USER_DICEBEAR_STYLES : COMMITTEE_DICEBEAR_STYLES;
  const avatars = styles.map((style) =>
    generateDiceBearAvatar(currentSeed, style.value),
  );

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
          <DialogTitle>
            {type === 'user'
              ? 'Choose Profile Picture'
              : 'Choose Committee Picture'}
          </DialogTitle>
          <DialogDescription>
            {type === 'user'
              ? 'Select an avatar style or upload your own image'
              : 'Select an abstract pattern or upload your own image'}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue='presets' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='presets'>
              <ImageIcon className='mr-2 h-4 w-4' />
              {type === 'user' ? 'Avatar Styles' : 'Patterns'}
            </TabsTrigger>
            <TabsTrigger value='upload'>
              <Upload className='mr-2 h-4 w-4' />
              Upload Custom
            </TabsTrigger>
          </TabsList>
          <TabsContent value='presets' className='mt-4'>
            <div className='grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 max-h-[400px] overflow-y-auto p-2'>
              {avatars.map((avatar, index) => (
                <div key={avatar} className='flex flex-col items-center gap-2'>
                  <button
                    onClick={() => handlePresetSelect(avatar)}
                    className={cn(
                      'relative rounded-full sm:h-20 sm:w-20 w-16 h-16 transition-all hover:ring-2 hover:ring-primary',
                      selectedPreset === avatar && 'ring-2 ring-primary',
                      currentAvatar === avatar && 'ring-2 ring-primary',
                    )}
                  >
                    <Avatar className='sm:h-20 sm:w-20 w-16 h-16'>
                      <AvatarImage src={avatar} alt={styles[index]?.name} />
                    </Avatar>
                  </button>
                  <span className='text-xs text-muted-foreground'>
                    {styles[index].name}
                  </span>
                </div>
              ))}
            </div>
            <div className='flex justify-end mt-3'>
              <Button
                onClick={handleRegenerate}
                variant='outline'
                size='sm'
                className='gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Regenerate
              </Button>
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
