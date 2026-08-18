import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminGuard>
      <ThemeProvider>
        <AdminLayout />
      </ThemeProvider>
    </AdminGuard>
  ),
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-sans text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/40">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
