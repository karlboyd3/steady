"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card">
      <h1>Something went wrong</h1>
      <p className="alert">{error.message}</p>
      <button className="big-btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
