
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  Pill,
  ShieldAlert,
  FileText,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/medication", label: "الأدوية", icon: Pill },
  { href: "/summarization", label: "التلخيص", icon: FileText },
];

const secondaryNavItems = [
    { href: "/new-patient", label: "تقييم جديد", icon: UserPlus },
]

export function SidebarNav() {
  const pathname = usePathname();

  const checkActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary">
            <rect width="256" height="256" fill="none"></rect>
            <path d="M128,24a104,104,0,1,0,104,104A104.2,104.2,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" fill="var(--primary) / 0.1)"></path>
            <path d="M163.5,82.5a40,40,0,0,0-71,0V96h71Z" fill="var(--primary) / 0.2)"></path>
            <path d="M163.5,82.5a40,40,0,0,0-71,0V96h71ZM112,96V84a20,20,0,0,1,32,0v12" fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"></path>
            <path d="M104,136a24,24,0,1,1,48,0c0,16-24,32-24,32S104,152,104,136Z" fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"></path>
          </svg>
          <div className="flex flex-col">
            <h2 className="text-lg font-headline font-semibold">NawabMD</h2>
            <p className="text-xs text-muted-foreground font-ruqaa">Clinical support with artificial intelligence</p>
          </div>
        </div>
        <div className="px-2 pb-2">
            <div className="border border-accent rounded-md px-3 py-2 text-center">
                <p className="font-ruqaa text-lg">عيادات اداك الطبية</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={checkActivePath(item.href)} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
         <Separator className="my-2" />
         {secondaryNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Separator />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarImage src="https://picsum.photos/100/100" alt="Dr. Smith" data-ai-hint="doctor portrait"/>
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">د. أحمد</span>
            <span className="text-xs text-muted-foreground">طبيب نفسي</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
