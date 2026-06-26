// components/analytics/AnalyticsLayout.tsx
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
    <div className="h-screen bg-stone-50 flex overflow-hidden">
      {sidebar}

      <div className="flex-1 flex flex-col min-w-0">
        {navbar}

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}