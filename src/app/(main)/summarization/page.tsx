
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { runSummaryAction } from "@/app/actions";
import { Loader, FileText, AlertTriangle, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SummaryOutput, OrchestratorInput } from "@/ai/flows/schemas";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SummarizationPage() {
  const [patientId, setPatientId] = useState("");
  const [foundPatient, setFoundPatient] = useState<OrchestratorInput | null>(null);
  const [summary, setSummary] = useState<SummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!patientId.trim()) {
      toast({ title: "معرف فارغ", description: "يرجى إدخال معرف المريض للبحث.", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    setFoundPatient(null);
    try {
      const storedResult = localStorage.getItem(`patient_results_${patientId}`);
      if (storedResult) {
        const result = JSON.parse(storedResult);
        setFoundPatient(result.input);
        toast({ title: "تم العثور على المريض", description: `تم تحميل بيانات المريض: ${result.input.name}` });
      } else {
        toast({ title: "لم يتم العثور على المريض", description: "الرجاء التأكد من صحة المعرف.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في قراءة بيانات المريض من التخزين المحلي.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!foundPatient) {
      toast({
        title: "لا يوجد مريض",
        description: "يرجى البحث عن مريض أولاً قبل إنشاء الملخص.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSummary(null);

    // Reconstruct patient data string for the summary model
    let patientDataString = `Patient Name: ${foundPatient.name}, Age: ${foundPatient.age}, Gender: ${foundPatient.gender}.\n`;
    patientDataString += `History: ${foundPatient.patientHistory}\n`;
    patientDataString += `Symptoms: ${foundPatient.symptoms.join(', ')}.\n`;
    if (foundPatient.currentMedications?.length) {
        patientDataString += `Medications: ${foundPatient.currentMedications.join(', ')}.\n`;
    }
    if (foundPatient.addictionHistory) {
        patientDataString += `Addiction History: ${foundPatient.addictionDetails}\n`;
    }
    if (foundPatient.familyHistory) {
        patientDataString += `Family History: ${foundPatient.familyHistoryDetails}\n`;
    }

    try {
      const result = await runSummaryAction({ 
          sessionNotes: `Clinical data review for patient ${foundPatient.name} (ID: ${foundPatient.patientId}).`, 
          patientData: patientDataString 
      });
      if (result) {
        setSummary(result);
        toast({
          title: "اكتمل التلخيص",
          description: "تم إنشاء الملخص بنجاح.",
        });
      } else {
        throw new Error("AI analysis returned no result.");
      }
    } catch (error) {
      console.error("Summarization failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "خطأ في التلخيص",
        description: `فشلت المعالجة: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="التلخيص الذكي"
        description="ابحث عن ملف المريض باستخدام الرقم التعريفي ثم قم بتلخيص بياناته المسجلة."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>1. البحث عن مريض</CardTitle>
             <CardDescription>أدخل الرقم التعريفي للمريض (مثل: AB-123) لجلب بياناته.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <Input
                id="patient-id"
                placeholder="أدخل الرقم التعريفي..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader className="ml-2 h-4 w-4 animate-spin" /> : <Search className="ml-2 h-4 w-4" />}
                بحث
              </Button>
            </div>
            
            {foundPatient && (
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><User /> ملف المريض</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                      <p><strong>الاسم:</strong> {foundPatient.name}</p>
                      <p><strong>العمر:</strong> {foundPatient.age}</p>
                      <p><strong>العرض الرئيسي:</strong> <Badge variant="secondary">{foundPatient.symptoms[0]}</Badge></p>
                       <div className="pt-4">
                           <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                              {isLoading ? (
                                <>
                                  <Loader className="ml-2 h-5 w-5 animate-spin" />
                                  جاري إنشاء الملخص...
                                </>
                              ) : (
                                "2. إنشاء ملخص للملف"
                              )}
                            </Button>
                       </div>
                  </CardContent>
              </Card>
            )}

          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText />
                    <span>النتائج</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                        <Loader className="h-10 w-10 animate-spin" />
                        <p className="mt-4">النموذج يعمل على تحليل البيانات...</p>
                    </div>
                )}
                {summary ? (
                    <div className="space-y-6">
                         <div>
                            <h4 className="font-semibold mb-2 text-base">موجز الحالة</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed bg-secondary p-3 rounded-md">{summary.briefing}</p>
                        </div>
                        <Separator />
                         <div>
                            <h4 className="font-semibold mb-2 text-base">النقاط الرئيسية</h4>
                            <ul className="list-disc pr-5 space-y-1 text-sm text-muted-foreground">
                                {summary.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                        {summary.criticalAlerts && summary.criticalAlerts.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 text-base text-destructive flex items-center gap-2"><AlertTriangle /> تنبيهات حرجة</h4>
                                <div className="space-y-2">
                                {summary.criticalAlerts.map((alert, i) => (
                                    <div key={i} className="border-r-4 border-destructive bg-destructive/10 p-3 rounded-md">
                                    <p className="font-bold text-destructive-foreground">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground">النوع: {alert.type} - الأهمية: {alert.urgency}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        {summary.suggestedQuestions && summary.suggestedQuestions.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 text-base">أسئلة مقترحة</h4>
                                <ul className="list-disc pr-5 space-y-1 text-sm text-muted-foreground">
                                    {summary.suggestedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    !isLoading && (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                            <FileText className="h-12 w-12" />
                            <p className="mt-4 text-center">سيظهر الملخص الذي تم إنشاؤه هنا بعد البحث عن مريض.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
