import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          The page you are looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
