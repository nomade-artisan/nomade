"use client";

export default function AnalyticsNavbar() {
  const refreshMetrics = async () => {
    await fetch("/api/analytics/build-metrics");
    location.reload();
  };

  return (
    <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-medium">
        Nomade Analytics
      </h1>

      <button
        onClick={refreshMetrics}
        className="
          px-4
          py-2
          rounded-full
          bg-stone-900
          text-white
          text-sm
        "
      >
        Actualiser
      </button>
    </header>
  );
}