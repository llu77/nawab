"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { runSummaryAction } from "@/app/actions";
import { Loader, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SummaryOutput } from "@/ai/flows/schemas";
import { Separator } from "@/components/ui/separator";

export default function SummarizationPage() {
  const [sessionNotes, setSessionNotes] = useState("");
  const [patientData, setPatientData] = useState("");
  const [summary, setSummary] = useState<SummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!sessionNotes.trim()) {
      toast({
        title: "حقل فارغ",
        description: "يرجى إدخال ملاحظات الجلسة على الأقل.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSummary(null);

    try {
      const result = await runSummaryAction({ sessionNotes, patientData });
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
        description="استخدم هذا النموذج لتلخيص الملاحظات السريرية وبيانات المرضى بسرعة ودقة."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>إدخال البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="session-notes" className="font-medium">ملاحظات الجلسة (مطلوب)</label>
              <Textarea
                id="session-notes"
                placeholder="اكتب أو الصق ملاحظات الجلسة السريرية هنا..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="patient-data" className="font-medium">بيانات المريض الإضافية (اختياري)</label>
               <Textarea
                id="patient-data"
                placeholder="أضف أي بيانات إضافية ذات صلة مثل نتائج المختبر، تقارير سابقة، أو ملاحظات من فريق العمل..."
                value={patientData}
                onChange={(e) => setPatientData(e.target.value)}
                rows={5}
              />
            </div>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء ملخص"
              )}
            </Button>
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
                            <p className="mt-4 text-center">سيظهر الملخص الذي تم إنشاؤه هنا.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
