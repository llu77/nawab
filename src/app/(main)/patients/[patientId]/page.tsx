
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { OrchestratorOutput, OrchestratorInput, IntegratedAnalysisOutput } from "@/ai/flows/schemas";
import { BrainCircuit, FileText, ShieldAlert, User, Activity, AlertTriangle, Target, Microscope, Stethoscope, Pilcrow, Link, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runIntegratedAnalysisAction } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


type PatientResult = {
    initialAnalysis: OrchestratorOutput;
    integratedAnalysis?: IntegratedAnalysisOutput;
    input: OrchestratorInput;
};

export default function PatientResultsPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [result, setResult] = useState<PatientResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideText, setOverrideText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      try {
        const storedResult = localStorage.getItem(`patient_results_${patientId}`);
        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);
          // For backwards compatibility, wrap old results in the new structure
          if (parsedResult.diagnosis) {
              setResult({ initialAnalysis: parsedResult, input: parsedResult.input });
          } else {
              setResult(parsedResult);
          }
        }
      } catch (error) {
        console.error("Failed to parse patient results from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [patientId]);
  
  const handleReanalysis = async () => {
    if (!result?.initialAnalysis || !result?.input) return;
    
    setIsReanalyzing(true);
    toast({ title: "بدء إعادة التحليل", description: "جاري دمج رأيك الطبي مع التحليل الأولي..."});
    
    try {
        const analysisResult = await runIntegratedAnalysisAction({
            patientId: result.input.patientId,
            initialAnalysis: result.initialAnalysis,
            doctorOverride: overrideText,
        });

        const newResultState = { ...result, integratedAnalysis: analysisResult };
        setResult(newResultState);
        localStorage.setItem(`patient_results_${patientId}`, JSON.stringify(newResultState));
        
        toast({ title: "اكتمل التحليل المتكامل", description: "تم تحديث التقرير بنجاح." });
        setShowOverride(false);

    } catch(error) {
        console.error("Failed during re-analysis:", error);
        toast({ title: "فشل التحليل", description: "حدث خطأ أثناء إعادة التحليل.", variant: "destructive" });
    } finally {
        setIsReanalyzing(false);
    }
  }


  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
        <Loader className="ml-2 h-8 w-8 animate-spin" />
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

  const { initialAnalysis, integratedAnalysis, input } = result;

  return (
    <>
      <PageHeader
        title={`التقرير التحليلي للمريض: ${input?.name || 'غير مسمى'}`}
        description={`عرض شامل لنتائج التحليل بواسطة الذكاء الاصطناعي للمعرف: ${patientId}`}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main column */}
        <div className="xl:col-span-2 space-y-6">
            {integratedAnalysis ? (
                 <IntegratedAnalysisCard analysis={integratedAnalysis} />
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-6">
                    {initialAnalysis.summary && <InitialSummaryCard summary={initialAnalysis.summary} />}
                    {initialAnalysis.diagnosis && <DiagnosisCard diagnosis={initialAnalysis.diagnosis} />}
                    {initialAnalysis.relapsePrediction && <RelapseCard relapsePrediction={initialAnalysis.relapsePrediction} />}
                </Accordion>
            )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
            <PatientInfoCard input={input} />
            <AnalysisControlCard 
                isIntegrated={!!integratedAnalysis}
                onStartAnalysis={handleReanalysis}
                isLoading={isReanalyzing}
            />
        </div>

      </div>

      <Card className="mt-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Edit />التدخل الطبي وإعادة التحليل</CardTitle>
            <CardDescription>يمكنك هنا إلغاء التحليل الأولي، إضافة رأيك الطبي، ثم إعادة التحليل للحصول على تقرير محدث ومدمج.</CardDescription>
        </CardHeader>
        <CardContent>
            {!showOverride ? (
                 <Button onClick={() => setShowOverride(true)}>إلغاء وإضافة رأي الطبيب</Button>
            ) : (
                <div className="space-y-4">
                    <Label htmlFor="override-text">أضف رأيك أو ملاحظاتك هنا</Label>
                    <Textarea 
                        id="override-text"
                        placeholder="مثال: أختلف مع تشخيص القلق، أعتقد أن الأعراض تشير بشكل أقوى إلى اضطراب الهلع. يرجى إعادة تقييم خطة العلاج بناءً على ذلك..."
                        value={overrideText}
                        onChange={(e) => setOverrideText(e.target.value)}
                        rows={5}
                    />
                </div>
            )}
        </CardContent>
        {showOverride && (
            <CardFooter className="justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowOverride(false)}>إلغاء</Button>
                <Button onClick={handleReanalysis} disabled={isReanalyzing || !overrideText}>
                     {isReanalyzing ? <Loader className="animate-spin ml-2" /> : null}
                    إعادة التحليل مع رأي الطبيب
                </Button>
            </CardFooter>
        )}
      </Card>
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

function AnalysisControlCard({ isIntegrated, onStartAnalysis, isLoading }: { isIntegrated: boolean; onStartAnalysis: () => void; isLoading: boolean; }) {
    if (isIntegrated) return null;
    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Microscope /> الخطوة التالية</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">النتائج الأولية جاهزة. قم بتشغيل التحليل المتكامل للحصول على تقرير أعمق وخطة علاج مقترحة.</p>
                <Button className="w-full" onClick={onStartAnalysis} disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin ml-2" />}
                    تشغيل التحليل المتكامل
                </Button>
            </CardContent>
        </Card>
    );
}


function InitialSummaryCard({ summary }: { summary: OrchestratorOutput['summary'] }) {
    if (!summary) return null;
    return (
         <AccordionItem value="summary">
            <AccordionTrigger className="text-lg font-semibold">
                 <div className="flex items-center gap-2"><FileText />الملخص التنفيذي الأولي</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div>
                    <h4 className="font-semibold mb-2 text-base">موجز الحالة</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{summary.briefing}</p>
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
            </AccordionContent>
        </AccordionItem>
    )
}

function DiagnosisCard({ diagnosis }: { diagnosis: OrchestratorOutput['diagnosis'] }) {
     if (!diagnosis) return null;
    return (
        <AccordionItem value="diagnosis">
            <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2"><BrainCircuit />فرضيات التشخيص الأولية</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
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
                             <h5 className="font-semibold text-sm mb-1">الأدلة الداعمة</h5>
                             <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">{hyp.supportingEvidence}</p>
                        </div>
                        {i < diagnosis.diagnosisHypotheses.length - 1 && <Separator />}
                    </div>
                ))}
            </AccordionContent>
        </AccordionItem>
    )
}


function RelapseCard({ relapsePrediction }: { relapsePrediction: OrchestratorOutput['relapsePrediction'] }) {
    if (!relapsePrediction) return null;
    const probability = relapsePrediction.relapseProbability;
    let colorClass = "text-green-600";
    if (probability > 40) colorClass = "text-yellow-600";
    if (probability > 70) colorClass = "text-red-600";

    return (
        <AccordionItem value="relapse">
            <AccordionTrigger className="text-lg font-semibold">
                 <div className="flex items-center gap-2"><ShieldAlert />تقييم مخاطر الانتكاس</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">احتمالية الانتكاس (6 أشهر)</p>
                    <p className={`text-6xl font-bold ${colorClass}`}>{probability.toFixed(0)}%</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-base flex items-center gap-2"><Target /> عوامل الخطر الرئيسية</h4>
                     <div className="flex flex-wrap gap-2">
                        {relapsePrediction.keyRiskFactors.map((factor, i) => <Badge key={i} variant="destructive">{factor}</Badge>)}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

function IntegratedAnalysisCard({ analysis }: { analysis: IntegratedAnalysisOutput }) {
    const { integratedDiagnosis, treatmentPlan, clinicalDiscussion, references, requiresManualReview } = analysis;
    return (
        <Card className="border-primary/40 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                    <Microscope className="text-primary"/>
                    <span>التقرير التحليلي المتكامل</span>
                </CardTitle>
                <CardDescription>هذا التقرير يدمج كافة البيانات الأولية مع طبقة تحليلية متقدمة لتقديم رؤية سريرية شاملة.</CardDescription>
                {requiresManualReview && (
                    <div className="p-3 rounded-md flex items-start gap-3 bg-yellow-100/80 dark:bg-yellow-900/40 border border-yellow-200/80 dark:border-yellow-800/60 mt-2">
                        <AlertTriangle className="mt-1 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                        <div>
                            <p className="font-bold text-yellow-800 dark:text-yellow-200">
                                تتطلب مراجعة يدوية
                            </p>
                            <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                                أوصى النظام بمراجعة هذه الحالة يدويًا بسبب وجود تعارض في البيانات أو انخفاض مستوى الثقة.
                            </p>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Integrated Diagnosis */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2"><Stethoscope /> التشخيص المتكامل</h3>
                    <div className="p-4 border rounded-lg bg-secondary/30">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm text-muted-foreground">التشخيص الأساسي</p>
                                <p className="text-lg font-bold text-primary">{integratedDiagnosis.primary.diagnosis}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">الثقة المدمجة</p>
                                <p className="font-bold text-2xl">{(integratedDiagnosis.confidence * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                         <Progress value={integratedDiagnosis.confidence * 100} className="h-2 mt-2" />
                    </div>
                    {integratedDiagnosis.secondary.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">التشخيصات الثانوية/المصاحبة</h4>
                            <div className="flex flex-wrap gap-2">
                                {integratedDiagnosis.secondary.map(d => <Badge key={d.diagnosis} variant="secondary">{d.diagnosis}</Badge>)}
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Clinical Discussion */}
                <div>
                     <h3 className="text-xl font-semibold flex items-center gap-2"><Pilcrow /> المناقشة السريرية</h3>
                     <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap p-4 bg-secondary/30 rounded-lg mt-2">{clinicalDiscussion}</p>
                </div>
                
                <Separator />

                {/* Treatment Plan */}
                <div>
                    <h3 className="text-xl font-semibold mb-3">خطة العلاج المقترحة</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                             <h4 className="font-semibold text-base">العلاج الدوائي</h4>
                             <p className="text-sm text-muted-foreground"><strong>الخط الأول:</strong> {treatmentPlan.pharmacological.firstLine.join(', ') || 'لا يوجد'}</p>
                             <p className="text-sm text-muted-foreground"><strong>الخط الثاني:</strong> {treatmentPlan.pharmacological.secondLine.join(', ') || 'لا يوجد'}</p>
                             <p className="text-sm text-destructive"><strong>موانع الاستعمال:</strong> {treatmentPlan.pharmacological.contraindicated.join(', ') || 'لا يوجد'}</p>
                        </div>
                         <div className="space-y-3">
                             <h4 className="font-semibold text-base">العلاج النفسي</h4>
                             <p className="text-sm text-muted-foreground"><strong>التوصيات:</strong> {treatmentPlan.psychotherapeutic.recommended.join(', ') || 'لا يوجد'}</p>
                             <p className="text-sm text-muted-foreground"><strong>المدة:</strong> {treatmentPlan.psychotherapeutic.duration}</p>
                             <p className="text-sm text-muted-foreground"><strong>التكرار:</strong> {treatmentPlan.psychotherapeutic.frequency}</p>
                        </div>
                    </div>
                </div>

                {references && references.length > 0 && (
                     <>
                        <Separator />
                        <div>
                             <h3 className="text-xl font-semibold flex items-center gap-2"><Link /> المراجع</h3>
                             <ul className="list-disc pr-5 mt-2 space-y-1 text-sm text-muted-foreground">
                                {references.map((ref, i) => <li key={i}>{ref}</li>)}
                             </ul>
                        </div>
                    </>
                )}

            </CardContent>
        </Card>
    );
}

