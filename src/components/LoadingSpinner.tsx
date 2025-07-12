export default function LoadingSpinner() {
  return (
    <div className="main-content-height flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}