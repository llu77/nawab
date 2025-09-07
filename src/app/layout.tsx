import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Tajawal, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export const metadata: Metadata = {
  title: 'NawabMD',
  description: 'نظام الذكاء الاصطناعي الاحترافي للصحة النفسية',
};

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn("font-body antialiased", tajawal.variable, spaceGrotesk.variable)}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <SidebarNav />
            <main className="flex-1 p-6 sm:p-8 md:p-10">
              {children}
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
