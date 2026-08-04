import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-neutral-700 mb-4">Page Not Found</h2>
      <p className="text-neutral-500 max-w-md mx-auto mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Return to Calculator</Button>
      </Link>
    </div>
  );
}
