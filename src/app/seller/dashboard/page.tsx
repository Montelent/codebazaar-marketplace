import { redirect } from "next/navigation";

/** Single-vendor store: seller routes go to admin */
export default function SellerDashboardRedirect() {
  redirect("/admin");
}
