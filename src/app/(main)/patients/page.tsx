
"use client";

import Link from "next/link";
import { UserPlus, Users, Construction } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientsPage() {

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
            <div className="text-center text-muted-foreground py-16">
              <Construction className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-semibold">قيد التطوير</p>
              <p className="mt-2">
                نعمل حاليًا على تطوير نظام إدارة المرضى ليتكامل مع وكلاء الذكاء الاصطناعي.
              </p>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
