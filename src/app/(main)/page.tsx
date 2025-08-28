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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";

const patients = [
  {
    id: "728ed52f",
    name: "John Doe",
    lastVisit: "2024-07-20",
    riskLevel: "Low",
    nextAppointment: "2024-08-15",
  },
  {
    id: "489e1d42",
    name: "Jane Smith",
    lastVisit: "2024-07-18",
    riskLevel: "High",
    nextAppointment: "2024-08-10",
  },
  {
    id: "f3f7a4b1",
    name: "Peter Jones",
    lastVisit: "2024-07-22",
    riskLevel: "Medium",
    nextAppointment: "2024-08-12",
  },
  {
    id: "a1b2c3d4",
    name: "Emily Brown",
    lastVisit: "2024-07-21",
    riskLevel: "Low",
    nextAppointment: "2024-08-20",
  },
  {
    id: "e5f6g7h8",
    name: "Michael Wilson",
    lastVisit: "2024-07-19",
    riskLevel: "Medium",
    nextAppointment: "2024-08-18",
  },
];

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
        <PageHeader title="لوحة التحكم" description="نظرة عامة على المرضى والمهام القادمة."/>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              التحليلات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    إجمالي المرضى
                  </CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">152</div>
                  <p className="text-sm text-muted-foreground">
                    +12 عن الشهر الماضي
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    المواعيد اليوم
                  </CardTitle>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">+5</div>
                  <p className="text-sm text-muted-foreground">
                    +2 عن الأمس
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
                  <div className="text-3xl font-bold text-destructive">3</div>
                   <p className="text-sm text-muted-foreground">
                    1 تنبيه عالي الخطورة
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    المهام المعلقة
                  </CardTitle>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">7</div>
                  <p className="text-sm text-muted-foreground">
                    2 منها تتطلب مراجعة
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>نظرة عامة على المرضى</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المريض</TableHead>
                        <TableHead>آخر زيارة</TableHead>
                        <TableHead>مستوى الخطورة</TableHead>
                        <TableHead className="text-right">الموعد القادم</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            <Link href={`/patient/${patient.id}`} className="hover:underline">
                              {patient.name}
                            </Link>
                          </TableCell>
                          <TableCell>{patient.lastVisit}</TableCell>
                          <TableCell>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                patient.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                patient.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>{patient.riskLevel}</span>
                          </TableCell>
                          <TableCell className="text-right">{patient.nextAppointment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                        <Link href={tool.href} key={tool.title} className="group block">
                        <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <tool.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                            <p className="font-semibold text-base">{tool.title}</p>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                        </Link>
                    ))}
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </>
  );
}
