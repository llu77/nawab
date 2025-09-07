
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Pill,
  ShieldAlert,
  FileText,
  Users,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
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
import { Badge } from "@/components/ui/badge";

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

type Patient = {
    id: string;
    name: string;
    date: string;
}

export default function DashboardPage() {
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [highRiskCount, setHighRiskCount] = useState(0);

    useEffect(() => {
        const storedList = JSON.parse(localStorage.getItem('patient_list') || '[]');
        setPatientList(storedList);

        let riskCount = 0;
        storedList.forEach((patient: Patient) => {
            const result = JSON.parse(localStorage.getItem(`patient_results_${patient.id}`) || '{}');
            if (result?.relapsePrediction?.relapseProbability > 70) {
                riskCount++;
            }
        });
        setHighRiskCount(riskCount);
    }, []);

  return (
    <MainLayout>
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
                  <div className="text-3xl font-bold">{patientList.length}</div>
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
                  <div className="text-3xl font-bold text-destructive">{highRiskCount}</div>
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
                   <CardDescription>
                    آخر 5 مرضى تم تقييمهم في النظام.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {patientList.length > 0 ? (
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>اسم المريض</TableHead>
                                <TableHead>المعرف</TableHead>
                                <TableHead>تاريخ التقييم</TableHead>
                                <TableHead>مستوى الخطر</TableHead>
                                <TableHead className="text-left">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patientList.slice(-5).reverse().map((patient) => {
                                const result = JSON.parse(localStorage.getItem(`patient_results_${patient.id}`) || '{}');
                                const risk = result?.relapsePrediction?.relapseProbability || 0;
                                return (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.name}</TableCell>
                                    <TableCell className="font-mono">{patient.id}</TableCell>
                                    <TableCell>{new Date(patient.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                         <Badge variant={risk > 70 ? "destructive" : risk > 40 ? "secondary" : "default"}
                                            className={risk > 40 && risk <= 70 ? "bg-yellow-400 text-yellow-900" : ""}
                                         >
                                            {risk > 70 ? "مرتفع" : risk > 40 ? "متوسط" : "منخفض"}
                                         </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/patients/${patient.id}`}>
                                                <Eye className="ml-2 h-4 w-4" />
                                                عرض التقرير
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                      </Table>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>لا يوجد مرضى مسجلون بعد.</p>
                        <Button asChild variant="link">
                        <Link href="/new-patient">ابدأ بتقييم جديد</Link>
                        </Button>
                    </div>
                  )}
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
    </MainLayout>
  );
}
