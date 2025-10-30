import ApiDocs from '@/components/features/docs/api-docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | Ceros',
  description: 'Complete API reference for Ceros platform',
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
