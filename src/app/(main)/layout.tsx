import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <div className="p-4 sm:p-6 md:p-8">
         {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
