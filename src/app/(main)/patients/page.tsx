
"use client";

import Link from "next/link";
import { UserPlus, Users, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type Patient = {
    id: string;
    name: string;
    date: string;
}

export default function PatientsPage() {
    const [patientList, setPatientList] = useState<Patient[]>([]);

    useEffect(() => {
        const storedList = JSON.parse(localStorage.getItem('patient_list') || '[]');
        // Sort by most recent first
        storedList.sort((a: Patient, b: Patient) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPatientList(storedList);
    }, []);

    const handleDelete = (patientId: string) => {
        const updatedList = patientList.filter(p => p.id !== patientId);
        setPatientList(updatedList);
        localStorage.setItem('patient_list', JSON.stringify(updatedList));
        localStorage.removeItem(`patient_results_${patientId}`);
    }


  return (
    <>
      <PageHeader
        title="قائمة المرضى"
        description="عرض وإدارة جميع المرضى المسجلين في النظام."
        actions={
          <Button asChild>
            <Link href="/new-patient">
              <UserPlus className="ml-2" />
              إدخال مريض جديد
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users />
            <span>المرضى المسجلون ({patientList.length})</span>
          </CardTitle>
          <CardDescription>
            هنا يمكنك عرض جميع المرضى الذين تم تقييمهم والوصول إلى تقاريرهم.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        {patientList.map((patient) => {
                            const result = JSON.parse(localStorage.getItem(`patient_results_${patient.id}`) || '{}');
                            const risk = result?.relapsePrediction?.relapseProbability || 0;
                            return (
                                <TableRow key={patient.id}>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell className="font-mono">{patient.id}</TableCell>
                                <TableCell>{new Date(patient.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                <TableCell>
                                    <Badge variant={risk > 70 ? "destructive" : risk > 40 ? "secondary" : "default"}
                                        className={risk > 40 && risk <= 70 ? "bg-yellow-400 text-yellow-900" : ""}
                                    >
                                        {risk > 70 ? "مرتفع" : risk > 40 ? "متوسط" : "منخفض"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-left flex items-center justify-end gap-2">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/patients/${patient.id}`}>
                                            <Eye className="ml-1 h-4 w-4" />
                                            عرض
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="ml-1 h-4 w-4" />
                                                حذف
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف بيانات المريض ونتائج تحليله بشكل دائم من هذا المتصفح.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(patient.id)}>
                                                نعم، قم بالحذف
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            ) : (
                 <div className="text-center text-muted-foreground py-16">
                    <Users className="mx-auto h-12 w-12" />
                    <p className="mt-4 text-lg font-semibold">لا يوجد مرضى بعد</p>
                    <p className="mt-2">
                        ابدأ بتقييم مريض جديد لإضافته إلى هذه القائمة.
                    </p>
                     <Button asChild className="mt-4">
                        <Link href="/new-patient">
                            <UserPlus className="ml-2" />
                            تقييم مريض جديد
                        </Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
