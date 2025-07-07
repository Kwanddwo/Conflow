"use client";
export default function AdminDashboard() {
  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to the admin dashboard. Here you can manage conference
            requests.
          </p>
        </div>
      </div>
    </div>
  );
}
