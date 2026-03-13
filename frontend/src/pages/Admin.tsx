import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMetricCards } from "@/components/admin/AdminMetricCards";
import { UserGrowthChart, ActivityByNeighborhoodChart, LevelDistributionChart } from "@/components/admin/AdminCharts";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminPendingActivities } from "@/components/admin/AdminPendingActivities";
import { AdminMedals } from "@/components/admin/AdminMedals";
import { AdminAlerts } from "@/components/admin/AdminAlerts";

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(210 20% 97%)" }}>
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
          {/* Page title */}
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Dashboard Administrativo</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Bayeux em Movimento — Visão geral do programa</p>
          </div>

          {/* Metric Cards */}
          <AdminMetricCards />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <UserGrowthChart />
            </div>
            <LevelDistributionChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activity by neighborhood */}
            <ActivityByNeighborhoodChart />

            {/* Alerts */}
            <AdminAlerts />
          </div>

          {/* Users Table */}
          <AdminUsersTable />

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AdminPendingActivities />
            <AdminMedals />
          </div>
        </main>
      </div>
    </div>
  );
}
