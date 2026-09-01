export const metadata = { title: "Downloads · Account" };

export default function DownloadsPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Downloads</h2>
      <p className="mt-1 text-sm text-slate-500">
        Download source files for items you own. Re-download anytime while your license is valid.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
        No downloads available. Purchase an item to unlock files.
      </div>
    </div>
  );
}
