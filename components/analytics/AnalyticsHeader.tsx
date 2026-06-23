interface AnalyticsLayoutProps {
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
  children: React.ReactNode;
}

export default function AnalyticsLayout({
  sidebar,
  navbar,
  children,
}: AnalyticsLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {sidebar}

      <div className="flex-1 flex flex-col">
        {navbar}

        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}