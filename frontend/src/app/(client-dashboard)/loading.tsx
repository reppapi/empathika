export default function ClientDashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#561269]/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#561269]" />
        </div>
        <p className="text-sm font-medium text-[#561269]/70 animate-pulse">
          Memuat dashboard...
        </p>
      </div>
    </div>
  );
}
