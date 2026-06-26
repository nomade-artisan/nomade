export default function AdminNavbar() {
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
      <div>
        <h1 className="font-semibold">
          Nomade Admin
        </h1>
      </div>

      <div className="text-sm text-muted-foreground">
        Administration
      </div>
    </header>
  );
}