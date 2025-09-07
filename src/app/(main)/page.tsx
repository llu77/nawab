
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Pill,
  ShieldAlert,
  FileText,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";

const quickAccessTools = [
  {
    title: "مساعد التشخيص",
    description: "تحليل الملاحظات للتشخيص.",
    icon: BrainCircuit,
    href: "/diagnosis",
  },
  {
    title: "الأدوية",
    description: "اقتراح بدائل وفحص التفاعلات.",
    icon: Pill,
    href: "/medication",
  },
  {
    title: "تقييم المخاطر",
    description: "توقع الانتكاس ومخاطر أخرى.",
    icon: ShieldAlert,
    href: "/risk-assessment",
  },
  {
    title: "التلخيص",
    description: "إنشاء ملخصات لبيانات المريض.",
    icon: FileText,
    href: "/summarization",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على المرضى والمهام القادمة."
      />
       <div className="space-y-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    إجمالي المرضى
                  </CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    مريض مسجل في النظام
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    تنبيهات المخاطر
                  </CardTitle>
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">0</div>
                  <p className="text-sm text-muted-foreground">
                    حالة ذات خطورة عالية
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>أحدث المرضى</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="text-center text-muted-foreground py-10">
                    <p>لا يوجد مرضى مسجلون بعد.</p>
                    <Button asChild variant="link">
                      <Link href="/new-patient">ابدأ بتقييم جديد</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>أدوات الذكاء الاصطناعي</CardTitle>
                  <CardDescription>
                    أدوات مساعدة لتعزيز سير عملك.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quickAccessTools.map((tool) => (
                      <Link
                        href={tool.href}
                        key={tool.title}
                        className="group block"
                      >
                        <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <tool.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-base">
                              {tool.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </>
  );
}
