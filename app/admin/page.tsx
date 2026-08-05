import { redirect } from "next/navigation";
import { isAdmin, isDefaultPassword } from "@/lib/auth";
import { getProducts, getSettings, getSignups } from "@/lib/db";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <AdminDashboard
      initialSettings={getSettings()}
      initialProducts={getProducts()}
      initialSignups={getSignups()}
      defaultPassword={isDefaultPassword()}
    />
  );
}
