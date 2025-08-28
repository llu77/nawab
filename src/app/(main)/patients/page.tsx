"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, Loader2, AlertCircle } from "lucide-react";
import { getPatients } from "./actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  registrationDate: string;
};

export default function PatientsPage() {
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
            <span>المرضى المسجلون</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>حدث خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && patients.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <Users className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg">لم يتم تسجيل أي مرضى بعد.</p>
              <p className="mt-2">انقر على "إدخال مريض جديد" للبدء.</p>
            </div>
          )}
          {!isLoading && !error && patients.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الملف</TableHead>
                  <TableHead>اسم المريض</TableHead>
                  <TableHead>العمر</TableHead>
                  <TableHead>الجنس</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{patient.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/patient/${patient.id}`} className="hover:underline text-primary">
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.registrationDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
