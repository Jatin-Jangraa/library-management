import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-700">404</h1>
        <p className="text-xl text-gray-500 mt-4">Page not found</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block transition-colors">Go Home</Link>
      </div>
    </div>
  );
}
