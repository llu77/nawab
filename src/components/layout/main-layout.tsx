import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 p-6 sm:p-8 md:p-10 bg-secondary/50">
         {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
