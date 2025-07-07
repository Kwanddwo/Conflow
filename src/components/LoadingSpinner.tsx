export default function LoadingSpinner() {
  return (
    <div className="main-content-height flex items-center justify-center" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}