'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import { authApi, type ApiResponse, type CheckEmailResponse } from '@/lib/api';
import Image from 'next/image';
import { CenteredDiv } from '../shared/layout/centered-div';
import { DefaultLoader } from '../shared/layout/loader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import Dashboard from '../features/dashboard';

type AuthStep = 'providers' | 'email' | 'password';

interface UnifiedAuthFormProps {
  className?: string;
}

function UnifiedAuthForm({
  className,
  ...props
}: UnifiedAuthFormProps & React.ComponentPropsWithoutRef<'div'>) {
  const [step, setStep] = useState<AuthStep>('providers');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    console.log(`Starting ${provider} OAuth flow`);

    try {
      await signIn(provider, {
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Social auth error:', error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      /* const { exists } = await authApi.checkEmail(email); */
      setStep('password');
    } catch (error) {
      console.error('Email check error:', error);
      setStep('password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const password = formData.get('password') as string;

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        try {
          const response: ApiResponse<CheckEmailResponse> =
            await authApi.checkEmail(email);

          if (!response.success) {
            toast.error('Failed to check email. Please try again.');
            return;
          }

          const { exists, hasPassword } = response.data;

          if (exists && !hasPassword) {
            toast.error(
              'This email is registered with Google/GitHub. Please use social login instead.',
            );
          } else if (exists && hasPassword) {
            toast.error('Incorrect password. Please try again.');
          } else {
            try {
              await authApi.register({ email, password });
              toast.success('Account created successfully!');
              await signIn('credentials', {
                email,
                password,
                callbackUrl: '/',
              });
            } catch (registerError: unknown) {
              console.error('Registration error:', registerError);
              if (registerError instanceof AxiosError) {
                const message =
                  registerError.response?.data?.message ||
                  'Failed to create account. Please try again.';
                toast.error(message);
              } else {
                toast.error('Failed to create account. Please try again.');
              }
            }
          }
        } catch (emailCheckError) {
          console.error('Email check error:', emailCheckError);
          toast.error('An error occurred. Please try again.');
        }
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToProviders = () => {
    setStep('providers');
    setEmail('');
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>
            {step === 'providers' && 'Welcome'}
            {step === 'email' && 'Enter your email'}
            {step === 'password' && 'Enter your password'}
          </CardTitle>
          <CardDescription>
            {step === 'providers' && 'Continue with your preferred method'}
            {step === 'email' && "We'll check if you have an account"}
            {step === 'password' && `Continue as ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'providers' && (
            <div className='grid gap-6'>
              <div className='flex flex-col gap-4'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    className='size-4'
                  >
                    <path
                      d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                      fill='currentColor'
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => handleSocialAuth('github')}
                  disabled={isLoading}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    className='size-4'
                  >
                    <path
                      d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z'
                      fill='currentColor'
                    />
                  </svg>
                  Continue with GitHub
                </Button>
              </div>
              <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                <span className='relative z-10 text-muted-foreground'>or</span>
              </div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setStep('email')}
                disabled={isLoading}
              >
                Continue with Email
              </Button>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className='grid gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={resetToProviders}
                  disabled={isLoading}
                >
                  <ArrowLeft className='size-4' />
                </Button>
                <Button
                  type='submit'
                  className='flex-1'
                  disabled={isLoading || !email}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </Button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className='grid gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  required
                  minLength={6}
                  autoFocus
                />
                <p className='text-xs text-muted-foreground'>
                  Password must be at least 6 characters
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  <ArrowLeft className='size-4' />
                </Button>
                <Button type='submit' className='flex-1' disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Continue'}
                </Button>
              </div>
              <div className='text-center'>
                <button
                  type='button'
                  className='text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline'
                  onClick={resetToProviders}
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function UnifiedAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <CenteredDiv>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <a href='' className='flex items-center gap-2 self-center font-medium'>
          <Image
            src='/images/logo.png'
            alt='RONR Logo'
            className='h-6 w-6 rounded-md object-contain'
            height={50}
            width={50}
          />
          CEROS
        </a>
        <UnifiedAuthForm />
      </div>
    </div>
  );
}
