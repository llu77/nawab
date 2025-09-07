
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Pill } from "lucide-react";

export default function MedicationPage() {
  return (
    <>
      <PageHeader
        title="إدارة الأدوية"
        description="هنا يمكنك البحث عن الأدوية، التحقق من التفاعلات، والحصول على معلومات دوائية."
      />
      <Card>
        <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-16">
                <Pill className="mx-auto h-12 w-12" />
                <p className="mt-4 text-lg font-semibold">قيد التطوير</p>
                <p className="mt-2">
                    هذه الميزة قيد الإنشاء حاليًا.
                </p>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
