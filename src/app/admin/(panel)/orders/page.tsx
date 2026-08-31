import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders · Admin" };

const DEMO = [
  { id: "ord_1001", buyer: "alex@example.com", total: 49, status: "PAID", method: "Stripe", items: "React Admin Dashboard Pro", createdAt: "2026-08-28" },
  { id: "ord_1002", buyer: "sam@studio.io", total: 79, status: "PENDING", method: "Bank transfer", items: "Laravel eCommerce Suite", createdAt: "2026-08-29" },
  { id: "ord_1003", buyer: "dev@agency.com", total: 249, status: "PAID", method: "Manual", items: "React Dashboard Pro (Extended)", createdAt: "2026-08-30" },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">Track purchases · mark manual / bank transfers as paid</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DEMO.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3">{o.buyer}</td>
                <td className="max-w-xs px-4 py-3">{o.items}</td>
                <td className="px-4 py-3">{o.method}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                  }`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
