
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Pill,
  ShieldAlert,
  FileText,
  Users,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { getPatients } from "./patients/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type Patient = {
  id: string;
  name: string;
  registrationDate: string;
  aiResults?: {
    relapsePrediction?: {
      relapseProbability: number;
    };
  };
};

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data as Patient[]);
      } else {
        setError(response.error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const highRiskAlerts = patients.filter(p => 
    (p.aiResults?.relapsePrediction?.relapseProbability ?? 0) > 70
  ).length;

  const getRiskLevel = (patient: Patient) => {
    const probability = patient.aiResults?.relapsePrediction?.relapseProbability;
    if (probability === undefined || probability === null) {
      return { label: "N/A", className: "bg-gray-100 text-gray-800" };
    }
    if (probability > 70) return { label: "High", className: "bg-red-100 text-red-800" };
    if (probability > 40) return { label: "Medium", className: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", className: "bg-green-100 text-green-800" };
  };

  const DashboardSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة على المرضى</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>أدوات الذكاء الاصطناعي</CardTitle>
            <CardDescription>أدوات مساعدة لتعزيز سير عملك.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {quickAccessTools.map((tool) => (
                    <div key={tool.title} className="flex items-start gap-4 rounded-lg border p-4">
                        <Skeleton className="h-10 w-10 rounded-lg"/>
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على المرضى والمهام القادمة."
      />
       <div className="space-y-6">
        {isLoading ? (
          <DashboardSkeleton/>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>حدث خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
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
                  <div className="text-3xl font-bold">{patients.length}</div>
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
                  <div className={`text-3xl font-bold ${highRiskAlerts > 0 ? 'text-destructive' : ''}`}>{highRiskAlerts}</div>
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
                  {patients.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم المريض</TableHead>
                          <TableHead>تاريخ التسجيل</TableHead>
                          <TableHead>مستوى الخطورة</TableHead>
                          <TableHead className="text-right">الإجراء</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.slice(0, 5).map((patient) => {
                          const risk = getRiskLevel(patient);
                          return (
                            <TableRow key={patient.id}>
                              <TableCell className="font-medium">
                                {patient.name}
                              </TableCell>
                              <TableCell>{patient.registrationDate}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${risk.className}`}>
                                  {risk.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/patient/${patient.id}`}>عرض الملف</Link>
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
        )}
      </div>
    </>
  );
}

    

    