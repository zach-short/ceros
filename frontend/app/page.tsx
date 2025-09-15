import { UnifiedAuth } from '@/components/auth/unified-auth';
import { ThemeToggle } from '@/components/shared/button/theme-toggle';

export default function LandingPage() {
  return (
    <div>
      <div className={`absolute top-5 right-5`}>
        <ThemeToggle />
      </div>

      <UnifiedAuth />
    </div>
  );
}
