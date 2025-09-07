
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEDICATION_CATEGORIES } from "@/lib/medications";
import { DIAGNOSIS_CATEGORIES } from "@/lib/diagnoses";
import { MultiSelect } from "@/components/ui/multi-select";
import { AlertTriangle, Pill, BookOpen, Loader, Bot, FileText, FlaskConical, Stethoscope } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { runMedicationAnalysisAction } from "@/app/actions";
import type { MedicationAnalysisOutput } from "@/ai/flows/schemas";
import { Separator } from "@/components/ui/separator";

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
  const [analysisResult, setAnalysisResult] = useState<MedicationAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (selectedMeds.length < 2) {
      toast({
        title: "أدوية غير كافية",
        description: "يرجى اختيار دواءين على الأقل لبدء التحليل.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);
    toast({
      title: "بدء التحليل الدوائي",
      description: "يقوم الصيدلي الإكلينيكي الافتراضي بمراجعة الأدوية المختارة..."
    });

    try {
      const result = await runMedicationAnalysisAction({
        currentMedications: selectedMeds,
        patientHistory: "General analysis without specific patient history.",
        patientGenetics: "",
      });

      if (result) {
        setAnalysisResult(result);
        toast({ title: "اكتمل التحليل", description: "تم استلام تقرير الصيدلي الإكلينيكي بنجاح." });
      } else {
        throw new Error("AI analysis returned no result.");
      }

    } catch (error) {
      console.error("Medication analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
          title: "خطأ في التحليل",
          description: `فشلت المعالجة: ${errorMessage}`,
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="الصيدلي الإكلينيكي"
        description="أداة تحليل دوائي متقدمة لفحص التفاعلات، اقتراح البدائل، ووضع خطط المراقبة."
      />
      <Tabs defaultValue="interactions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactions">التحليل الدوائي</TabsTrigger>
          <TabsTrigger value="med-list">قائمة الأدوية</TabsTrigger>
          <TabsTrigger value="diagnoses">قائمة التشخيصات</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FlaskConical /> مدخلات التحليل</CardTitle>
                <CardDescription>اختر الأدوية التي ترغب في تحليلها، ثم اضغط على زر التحليل.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                  <div>
                      <h3 className="text-lg font-semibold mb-2">الأدوية الحالية</h3>
                      <p className="text-sm text-muted-foreground mb-4">اختر دواءين أو أكثر لتشغيل وكيل الصيدلة الإكلينيكية.</p>
                      <MultiSelect
                          options={allMedications}
                          selected={selectedMeds}
                          onChange={setSelectedMeds}
                          placeholder="ابحث واختر من قائمة الأدوية..."
                      />
                  </div>
                  <Button onClick={handleAnalyze} disabled={isLoading || selectedMeds.length < 1} className="w-full" size="lg">
                    {isLoading ? (
                      <>
                        <Loader className="ml-2 h-5 w-5 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Bot className="ml-2 h-5 w-5" />
                        تحليل التفاعلات والبدائل
                      </>
                    )}
                  </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText /> تقرير الصيدلي الإكلينيكي</CardTitle>
                  <CardDescription>نتائج التحليل تظهر هنا بعد اكتمال العملية.</CardDescription>
              </CardHeader>
              <CardContent>
                  {isLoading && (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                          <Loader className="h-10 w-10 animate-spin text-primary" />
                          <p className="mt-4">يقوم الوكيل بتحليل البيانات...</p>
                      </div>
                  )}
                  {analysisResult ? (
                      <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-6">
                          {analysisResult.drugInteractions.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-base text-destructive flex items-center gap-2"><AlertTriangle /> تفاعلات دوائية</h4>
                              <div className="space-y-3">
                                {analysisResult.drugInteractions.map((interaction, i) => (
                                  <div key={i} className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                    <p className="font-bold">{interaction.drug1} + {interaction.drug2}</p>
                                    <Badge variant="destructive" className="my-1">{interaction.severity}</Badge>
                                    <p className="text-sm text-destructive/90">{interaction.clinicalSignificance}</p>
                                    <p className="text-sm mt-1"><strong>التوصية:</strong> {interaction.recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysisResult.alternatives.length > 0 && (
                             <div>
                              <h4 className="font-semibold mb-2 text-base flex items-center gap-2"><Pill /> بدائل مقترحة</h4>
                               <div className="space-y-2">
                                {analysisResult.alternatives.map((alt, i) => (
                                    <div key={i} className="p-3 rounded-md bg-secondary">
                                      <p className="font-bold text-primary">{alt.medication}</p>
                                      <p className="text-sm text-muted-foreground">{alt.rationale}</p>
                                    </div>
                                ))}
                               </div>
                            </div>
                          )}
                          {analysisResult.monitoringPlan.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-base flex items-center gap-2"><Stethoscope /> خطة المراقبة</h4>
                               <ul className="list-disc pr-5 space-y-1 text-sm text-muted-foreground">
                                  {analysisResult.monitoringPlan.map((plan, i) => <li key={i}><strong>{plan.parameter}:</strong> {plan.frequency}</li>)}
                               </ul>
                            </div>
                          )}
                           <Separator />
                           <div>
                              <h4 className="font-semibold mb-2 text-base">ملاحظات الصيدلي</h4>
                              <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md whitespace-pre-wrap">{analysisResult.pharmacistNotes}</p>
                           </div>
                        </div>
                      </ScrollArea>
                  ) : (
                      !isLoading && (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                              <Bot className="h-12 w-12" />
                              <p className="mt-4 text-center">النتائج ستظهر هنا بعد تشغيل التحليل.</p>
                          </div>
                      )
                  )}
              </CardContent>
            </Card>
          </div>
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
