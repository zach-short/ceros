import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { CenteredDiv } from '../layout/centered-div';
import { DefaultLoader } from '../layout/loader';

type DataStateProps<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refetch?: () => void;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ error: Error; onRetry?: () => void }>;
  EmptyComponent?: React.ComponentType;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  validate?: (data: T) => { isValid: boolean; error?: Error };
};

const DefaultErrorComponent = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) => (
  <div className='flex flex-col items-center justify-center p-8 text-center'>
    <div className='text-destructive mb-4'>
      <svg
        className='h-12 w-12 mx-auto mb-2'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <h3 className='text-lg font-semibold'>Something went wrong</h3>
    </div>
    <p className='text-muted-foreground mb-4'>
      {error.message || 'An unexpected error occurred'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
      >
        Try Again
      </button>
    )}
  </div>
);

const DefaultEmptyComponent = () => (
  <div className='flex flex-col items-center justify-center p-8 text-center'>
    <div className='text-muted-foreground mb-4'>
      <svg
        className='h-12 w-12 mx-auto mb-2'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m10-8v2m0 0v2m0-2h2m-2 0h-2'
        />
      </svg>
      <h3 className='text-lg font-semibold'>No data available</h3>
    </div>
    <p className='text-muted-foreground'>
      There&apos;s nothing to display at the moment.
    </p>
  </div>
);

export function DataState<T>({
  data,
  error,
  isLoading,
  refetch,
  LoadingComponent = () => (
    <CenteredDiv>
      <DefaultLoader />
    </CenteredDiv>
  ),
  ErrorComponent = DefaultErrorComponent,
  EmptyComponent = DefaultEmptyComponent,
  children,
  isEmpty = (data) =>
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && Object.keys(data).length === 0),
  validate,
}: DataStateProps<T>) {
  if (isLoading && !data) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} onRetry={refetch} />;
  }

  if (!data || isEmpty(data)) {
    return <EmptyComponent />;
  }

  if (validate) {
    const validation = validate(data);
    if (!validation.isValid) {
      const validationError =
        validation.error || new Error('Data validation failed');
      return <ErrorComponent error={validationError} onRetry={refetch} />;
    }
  }

  return <>{children(data)}</>;
}
