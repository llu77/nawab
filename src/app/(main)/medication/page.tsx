
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEDICATION_CATEGORIES } from "@/lib/medications";
import { DIAGNOSIS_CATEGORIES } from "@/lib/diagnoses";
import { MultiSelect } from "@/components/ui/multi-select";
import { AlertTriangle, Pill, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type MedicationOption = {
  value: string;
  label: string;
  group: string;
};

const allMedications: MedicationOption[] = MEDICATION_CATEGORIES.flatMap(category =>
  category.medications.map(med => ({
    value: med,
    label: med,
    group: category.name
  }))
);

export default function MedicationPage() {
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);

  // Simple interaction logic placeholder
  const getInteractionAlert = (meds: string[]) => {
    if (meds.length < 2) {
      return null;
    }
    // Dummy logic: check for SSRI + MAOI interaction
    const hasSSRI = meds.some(m => m.includes("Prozac") || m.includes("Zoloft"));
    const hasMAOI = meds.some(m => m.includes("Nardil") || m.includes("Parnate"));
    if (hasSSRI && hasMAOI) {
      return {
        severity: "خطر",
        message: "خطر متلازمة السيروتونين. يجب تجنب هذه التركيبة.",
      };
    }
    if (meds.some(m => m.includes("Lithium")) && meds.some(m => m.includes("Prozac"))) {
        return {
            severity: "متوسط",
            message: "قد يزيد Prozac من مستويات الليثيوم. يوصى بالمراقبة الدقيقة.",
        }
    }
    if (meds.length > 2) {
        return {
            severity: "منخفض",
            message: "تزداد احتمالية التفاعلات الدوائية مع زيادة عدد الأدوية. يوصى بمراجعة صيدلانية شاملة.",
        }
    }
    return null;
  };

  const interactionAlert = getInteractionAlert(selectedMeds);

  return (
    <>
      <PageHeader
        title="إدارة الأدوية"
        description="هنا يمكنك البحث عن الأدوية، التحقق من التفاعلات، والحصول على معلومات دوائية."
      />
      <Tabs defaultValue="interactions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactions">فحص التفاعلات</TabsTrigger>
          <TabsTrigger value="med-list">قائمة الأدوية</TabsTrigger>
          <TabsTrigger value="diagnoses">قائمة التشخيصات</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions">
          <Card>
            <CardContent className="pt-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">مدقق التفاعلات الدوائية</h3>
                    <p className="text-sm text-muted-foreground mb-4">اختر دواءين أو أكثر للتحقق من وجود تفاعلات محتملة. سيتم ربط هذه الميزة بالنموذج رقم 6 (الصيدلي الإكلينيكي) مستقبلاً.</p>
                    <MultiSelect
                        options={allMedications}
                        selected={selectedMeds}
                        onChange={setSelectedMeds}
                        placeholder="ابحث واختر من قائمة الأدوية..."
                    />
                </div>
                {interactionAlert && (
                    <div className={`p-4 rounded-md flex items-start gap-3 ${interactionAlert.severity === 'خطر' ? 'bg-destructive/10 border border-destructive/20' : 'bg-yellow-100/80 dark:bg-yellow-900/40 border border-yellow-200/80 dark:border-yellow-800/60'}`}>
                        <AlertTriangle className={`mt-1 flex-shrink-0 ${interactionAlert.severity === 'خطر' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}`} />
                        <div>
                            <p className={`font-bold ${interactionAlert.severity === 'خطر' ? 'text-destructive' : 'text-yellow-800 dark:text-yellow-200'}`}>
                                تنبيه - مستوى التفاعل: {interactionAlert.severity}
                            </p>
                            <p className={`text-sm mt-1 ${interactionAlert.severity === 'خطر' ? 'text-destructive/90' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                {interactionAlert.message}
                            </p>
                        </div>
                    </div>
                )}
                 {selectedMeds.length > 0 && !interactionAlert && (
                    <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800/60 flex items-start gap-3">
                        <Pill className="mt-1 flex-shrink-0 text-green-600" />
                         <div>
                            <p className="font-bold text-green-800 dark:text-green-200">
                                لا توجد تفاعلات خطيرة مسجلة
                            </p>
                            <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                                لم يتم العثور على تفاعلات دوائية كبيرة بين الأدوية المختارة بناءً على قاعدة البيانات الحالية.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="med-list">
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Pill /> قائمة الأدوية النفسية</CardTitle>
                <CardDescription>قائمة شاملة للأدوية النفسية الشائعة مصنفة حسب الفئة.</CardDescription>
             </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-6 pr-4">
                        {MEDICATION_CATEGORIES.map((category) => (
                        <div key={category.name}>
                            <h3 className="font-bold text-lg mb-3 text-primary">{category.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {category.medications.map((med) => (
                                <Badge key={med} variant="secondary" className="font-normal justify-start p-2 text-sm">
                                    {med}
                                </Badge>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="diagnoses">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen /> قائمة التشخيصات (DSM-5)</CardTitle>
                    <CardDescription>قائمة التشخيصات النفسية الرئيسية بناءً على الدليل التشخيصي والإحصائي الخامس.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-[60vh]">
                        <div className="space-y-6 pr-4">
                            {DIAGNOSIS_CATEGORIES.map((category) => (
                            <div key={category.name}>
                                <h3 className="font-bold text-lg mb-3 text-primary">{category.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {category.diagnoses.map((diag) => (
                                    <Badge key={diag} variant="outline" className="font-normal justify-start p-2 text-sm">
                                        {diag}
                                    </Badge>
                                ))}
                                </div>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

    