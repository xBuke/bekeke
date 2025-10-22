import { requireRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DollarSign, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import PendingProvidersTable from "@/components/dashboard/PendingProvidersTable";

export default async function AdminPage() {
  await requireRole(["admin"]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString();

  const [{ data: verifiedCount }, { data: pendingCount }, { data: bookingsCount }, { data: feesSum }] = await Promise.all([
    supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("verification_status", "verified"),
    supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("payments").select("platform_fee").gte("created_at", startOfMonth),
  ]);

  const totalFees = (feesSum || []).reduce((sum: number, row: any) => sum + (row.platform_fee || 0), 0);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Verified pružatelji" count={verifiedCount ?? 0} icon={<CheckCircle2 />} />
          <StatsCard title="Čeka verifikaciju" count={pendingCount ?? 0} icon={<Clock />} />
          <StatsCard title="Bookings (ovaj mjesec)" count={bookingsCount ?? 0} icon={<CalendarDays />} />
          <StatsCard title="Provizija (ovaj mjesec)" count={`${totalFees.toFixed(2)}€`} icon={<DollarSign />} />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Novi pružatelji</h2>
          </div>
          <PendingProvidersTable />
        </section>
      </main>
    </div>
  );
}


