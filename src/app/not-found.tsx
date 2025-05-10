import Link from "next/link";

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you're looking for doesn't exist.</p>
      <Link
        href="/" 
        className="px-6 py-3 bg-brand rounded-md hover:bg-brand-dark transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}