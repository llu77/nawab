
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestratorOutput, OrchestratorInput, DiagnosePatientOutput, RelapsePredictionOutput, SummaryOutput } from "@/ai/flows/schemas";
import { BrainCircuit, FileText, ShieldAlert, User, Activity, AlertTriangle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// We need to combine the input and output types for the full context
type PatientResult = OrchestratorOutput & {
    input: OrchestratorInput;
};

export default function PatientResultsPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [result, setResult] = useState<PatientResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      try {
        const storedResult = localStorage.getItem(`patient_results_${patientId}`);
        if (storedResult) {
          setResult(JSON.parse(storedResult));
        }
      } catch (error) {
        console.error("Failed to parse patient results from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [patientId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
        <p>جاري تحميل النتائج...</p>
    </div>;
  }

  if (!result) {
    return (
      <>
        <PageHeader
          title="لم يتم العثور على نتائج"
          description={`تعذر العثور على نتائج التحليل للمريض صاحب المعرف: ${patientId}`}
        />
        <Card>
            <CardContent className="pt-6">
                <p>قد يكون السبب هو عدم إكمال عملية التقييم أو حدوث خطأ أثناء المعالجة. يرجى محاولة تقييم المريض مرة أخرى.</p>
            </CardContent>
        </Card>
      </>
    );
  }

  const { diagnosis, relapsePrediction, summary, input } = result;

  return (
    <>
      <PageHeader
        title={`التقرير التحليلي للمريض: ${input?.name || 'غير مسمى'}`}
        description={`عرض شامل لنتائج التحليل بواسطة الذكاء الاصطناعي للمعرف: ${patientId}`}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main column */}
        <div className="xl:col-span-2 space-y-6">
            {summary && <SummaryCard summary={summary} />}
            {diagnosis && <DiagnosisCard diagnosis={diagnosis} />}
            {relapsePrediction && <RelapseCard relapsePrediction={relapsePrediction} />}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
            {input && <PatientInfoCard input={input} />}
        </div>

      </div>
    </>
  );
}

function PatientInfoCard({ input }: { input: OrchestratorInput }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User />
                    <span>ملف المريض</span>
                </CardTitle>
                 <CardDescription>البيانات الأساسية التي تم إدخالها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم</span>
                    <span className="font-medium">{input.name}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">العمر</span>
                    <span className="font-medium">{input.age}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">الجنس</span>
                    <span className="font-medium">{input.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-medium mb-2">الأعراض الرئيسية</h4>
                    <div className="flex flex-wrap gap-2">
                        {input.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                </div>
                {input.currentMedications && input.currentMedications.length > 0 && (
                     <div>
                        <h4 className="font-medium mb-2">الأدوية الحالية/السابقة</h4>
                        <div className="flex flex-wrap gap-2">
                            {input.currentMedications.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
                        </div>
                    </div>
                )}
                {input.addictionHistory && (
                     <div>
                        <h4 className="font-medium text-destructive mb-2">تاريخ إدمان</h4>
                        <p className="text-muted-foreground bg-destructive/10 p-2 rounded-md">{input.addictionDetails}</p>
                    </div>
                )}
                 {input.familyHistory && (
                     <div>
                        <h4 className="font-medium mb-2">تاريخ عائلي</h4>
                        <p className="text-muted-foreground bg-secondary p-2 rounded-md">{input.familyHistoryDetails}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SummaryCard({ summary }: { summary: SummaryOutput }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText />
                    <span>الملخص التنفيذي</span>
                </CardTitle>
                <CardDescription>نظرة عامة سريعة من المساعد الذكي.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2 text-base">موجز الحالة</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{summary.briefing}</p>
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
            </CardContent>
        </Card>
    )
}

function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosePatientOutput }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit />
                    <span>فرضيات التشخيص</span>
                </CardTitle>
                <CardDescription>تحليل الأعراض بناءً على معايير DSM-5.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {diagnosis.diagnosisHypotheses.map((hyp, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-lg text-primary">{hyp.diagnosis}</h4>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">الثقة</p>
                                <p className="font-bold text-xl">{(hyp.confidence * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                        <Progress value={hyp.confidence * 100} className="h-2" />
                        <div>
                             <h5 className="font-semibold text-sm mb-1">المنطق التشخيصي</h5>
                             <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{hyp.reasoning}</p>
                        </div>
                         <div>
                             <h5 className="font-semibold text-sm mb-1">الأدلة الداعمة</h5>
                             <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">{hyp.supportingEvidence}</p>
                        </div>
                        {i < diagnosis.diagnosisHypotheses.length - 1 && <Separator />}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}


function RelapseCard({ relapsePrediction }: { relapsePrediction: RelapsePredictionOutput }) {
    const probability = relapsePrediction.relapseProbability;
    let colorClass = "text-green-600";
    if (probability > 40) colorClass = "text-yellow-600";
    if (probability > 70) colorClass = "text-red-600";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert />
                    <span>تقييم مخاطر الانتكاس</span>
                </CardTitle>
                <CardDescription>تحليل تنبؤي للمخاطر خلال 6 أشهر قادمة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">احتمالية الانتكاس</p>
                    <p className={`text-6xl font-bold ${colorClass}`}>{probability.toFixed(0)}%</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-base flex items-center gap-2"><Activity /> المبررات</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed p-3 bg-secondary rounded-md">{relapsePrediction.rationale}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-base flex items-center gap-2"><Target /> عوامل الخطر الرئيسية</h4>
                     <div className="flex flex-wrap gap-2">
                        {relapsePrediction.keyRiskFactors.map((factor, i) => <Badge key={i} variant="destructive">{factor}</Badge>)}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

    