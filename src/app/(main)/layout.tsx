import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <main className="md:pl-[var(--sidebar-width)]">
        <div className="p-6 sm:p-8 md:p-10">
         {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
