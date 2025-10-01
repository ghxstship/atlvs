import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-content-lg p-lg text-center">
      <Search className="h-component-md w-component-md text-gray-400 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Dashboard Page Not Found
      </h1>
      <p className="text-gray-600 mb-6 max-w-md">
        The dashboard page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-md py-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-icon-xs w-icon-xs mr-2" />
          Back to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-md py-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
