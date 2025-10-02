import { MenuContent } from '@/components/shared/layout/menu-content';

export default function Menu() {
  return (
    <div className='h-[calc(100vh-4rem)] sm:flex sm:flex-row justify-center w-full lg:h-screen p-6 overflow-y-auto'>
      <MenuContent className='h-full' />
    </div>
  );
}