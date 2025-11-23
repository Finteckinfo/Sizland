import React from 'react';
import { PageLayout } from '@/components/page-layout';

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Service - Sizland" description="Terms of Service" requireAuth={false}>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </PageLayout>
  );
}

