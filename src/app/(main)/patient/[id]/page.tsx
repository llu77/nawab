
"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  FileText,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldAlert,
  Stethoscope,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  FlaskConical,
  ClipboardList,
  Printer,
  Share2,
  CheckCircle,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getPatientData, runIntegratedAnalysis } from "./actions";
import type { OrchestratorOutput, IntegratedAnalysisOutput } from "@/ai/flows/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define a more comprehensive patient data type
type PatientData = {
  id: string;
  name: string;
  age: number;
  gender: string;
  registrationDate: string;
  patientId: string; // The same as id
  patientHistory: string;
  symptoms: string[];
  currentMedications?: string[];
  addictionHistory: boolean;
  addictionDetails?: string;
  familyHistory: boolean;
  familyHistoryDetails?: string;
  aiResults?: OrchestratorOutput;
  integratedAnalysis?: IntegratedAnalysisOutput;
  integratedAnalysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingErrors?: {model: string; error: string}[];
};


const getRiskColor = (probability: number) => {
    if (probability > 70) return "bg-destructive";
    if (probability > 40) return "bg-yellow-500";
    return "bg-green-500";
};
  
const getRiskLevel = (probability: number) => {
    if (probability > 70) return "مرتفع";
    if (probability > 40) return "متوسط";
    return "منخفض";
};


export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchPatientData = async () => {
    setIsLoading(true);
    setError(null);
    const response = await getPatientData(params.id);
    if (response.success) {
      setPatient(response.data as PatientData);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPatientData();
  }, [params.id]);


  const handleRunAnalysis = async () => {
    if (!patient || !patient.aiResults) return;
    setIsAnalyzing(true);
    const response = await runIntegratedAnalysis(patient.id, patient.aiResults);
    setIsAnalyzing(false);

    if (response.success) {
      toast({
        title: "اكتمل التحليل المتكامل",
        description: "تم تحديث ملف المريض بالتشخيص الموحد وخطة العلاج.",
      });
      // Refresh data
      fetchPatientData(); 
    } else {
      toast({
        variant: "destructive",
        title: "فشل التحليل المتكامل",
        description: response.error,
      });
       // Refresh data to show 'failed' status
      fetchPatientData();
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>حدث خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!patient) {
     return (
       <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>لم يتم العثور على المريض</AlertTitle>
          <AlertDescription>لا يمكن العثور على بيانات للمعرف المحدد.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const defaultTab = patient.integratedAnalysisStatus === 'completed' ? 'integrated-analysis' : 'initial-assessment';

  return (
    <>
      <PageHeader
        title={patient.name}
        description={`ملف المريض رقم: ${patient.patientId}`}
        className="mb-6"
        actions={
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => window.print()}><Printer className="ml-2 h-4 w-4"/>طباعة</Button>
                <Button variant="outline" onClick={() => alert('سيتم تطبيق وظيفة المشاركة قريباً.')}><Share2 className="ml-2 h-4 w-4"/>مشاركة</Button>
                <Button disabled={patient.integratedAnalysisStatus !== 'completed'} onClick={() => alert('تمت الموافقة على الخطة العلاجية (محاكاة).')}><CheckCircle className="ml-2 h-4 w-4"/>الموافقة على الخطة</Button>
            </div>
        }
      />
      <div className="space-y-6">
        {patient.processingErrors && patient.processingErrors.length > 0 && (
            <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>فشل جزئي في المعالجة</AlertTitle>
            <AlertDescription>
                <p>اكتملت بعض تحليلات الذكاء الاصطناعي بنجاح، لكن البعض الآخر فشل. قد تكون البيانات المعروضة غير مكتملة.</p>
                <ul className="mt-2 list-disc list-inside text-xs">
                {patient.processingErrors.map((err, index) => (
                    <li key={index}>فشل نموذج <strong>{err.model}</strong>: {typeof err.error === 'object' ? JSON.stringify(err.error) : err.error}</li>
                ))}
                </ul>
            </AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="initial-assessment">التقييم الأولي</TabsTrigger>
                <TabsTrigger value="integrated-analysis" disabled={patient.integratedAnalysisStatus !== 'completed'}>التحليل المتكامل</TabsTrigger>
                <TabsTrigger value="discussion" disabled>المناقشة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="initial-assessment" className="mt-6 space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-6 w-6" />
                        <span>ملخص الحالة الأولي</span>
                    </CardTitle>
                    <CardDescription>
                        المعلومات المدخلة عند تسجيل المريض في {patient.registrationDate}
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-base">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-1"><History className="h-5 w-5 text-primary"/>تاريخ مرضي مختصر</h4>
                        <p className="text-muted-foreground">{patient.patientHistory}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Stethoscope className="h-5 w-5 text-primary"/>الأعراض الرئيسية</h4>
                            <div className="flex flex-wrap gap-2">
                            {patient.symptoms.map(symptom => (
                                <Badge key={symptom} variant="secondary">{symptom}</Badge>
                            ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Pill className="h-5 w-5 text-primary"/>الأدوية السابقة/الحالية</h4>
                            <p className="text-muted-foreground">{patient.currentMedications?.join(', ') || 'لا يوجد'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><HeartPulse className="h-5 w-5 text-primary"/>التاريخ الشخصي والعائلي</h4>
                            <p className="text-muted-foreground"><strong className="font-medium text-foreground">تاريخ الإدمان:</strong> {patient.addictionHistory ? `نعم - ${patient.addictionDetails}` : 'لا يوجد'}</p>
                            <p className="text-muted-foreground"><strong className="font-medium text-foreground">التاريخ العائلي:</strong> {patient.familyHistory ? `نعم - ${patient.familyHistoryDetails}` : 'لا يوجد'}</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                <Accordion type="multiple" className="w-full space-y-4">
                  <Card>
                    <AccordionItem value="item-1" className="border-0">
                       <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-3">
                          <BrainCircuit className="h-6 w-6" />
                          <span>التحليلات الأولية (بواسطة AI)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-6 pt-0 space-y-6">
                        {patient.aiResults?.diagnosis && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <span>الفرضيات التشخيصية</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full" defaultValue="diag-0">
                                  {patient.aiResults.diagnosis.diagnosisHypotheses.map((hypothesis, index) => (
                                    <AccordionItem value={`diag-${index}`} key={index}>
                                      <AccordionTrigger className="text-base hover:no-underline">
                                        <div className="flex items-center gap-4 w-full">
                                          <span className="font-semibold">{hypothesis.diagnosis}</span>
                                          <Badge variant={hypothesis.confidence > 0.7 ? "default" : "secondary"} className="text-sm">
                                            {`الثقة: ${(hypothesis.confidence * 100).toFixed(0)}%`}
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="space-y-4 px-2 text-sm">
                                        <div>
                                          <h4 className="font-semibold mb-1">المنطق (معايير DSM-5)</h4>
                                          <p className="text-muted-foreground">{hypothesis.reasoning}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-1">الأدلة الداعمة</h4>
                                          <p className="text-muted-foreground">{hypothesis.supportingEvidence}</p>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                            </CardContent>
                          </Card>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                          {patient.aiResults?.relapsePrediction && (
                              <Card>
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-base">
                                      <ShieldAlert className="h-5 w-5" />
                                      <span>تنبؤات المخاطر</span>
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  <div className="text-center">
                                      <p className="text-sm font-medium text-muted-foreground">احتمالية الانتكاس</p>
                                      <p className="text-5xl font-bold font-headline mt-1">
                                      {patient.aiResults.relapsePrediction.relapseProbability.toFixed(1)}%
                                      </p>
                                      <div className="flex items-center justify-center gap-2 mt-3">
                                      <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${getRiskColor(patient.aiResults.relapsePrediction.relapseProbability)}`}>
                                          خطر {getRiskLevel(patient.aiResults.relapsePrediction.relapseProbability)}
                                      </span>
                                      </div>
                                  </div>
                                  <div className="w-full px-2">
                                      <Progress value={patient.aiResults.relapsePrediction.relapseProbability} className="h-2 [&>div]:bg-primary" />
                                  </div>
                                  <div>
                                      <h4 className="font-semibold text-sm mb-1">الأساس المنطقي</h4>
                                      <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">{patient.aiResults.relapsePrediction.rationale}</p>
                                  </div>
                              </CardContent>
                              </Card>
                          )}
                          {patient.aiResults?.summary?.briefing && (
                              <Card>
                                  <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-base">
                                      <FileText className="h-5 w-5" />
                                      <span>ملخص الذكاء الاصطناعي</span>
                                  </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="prose prose-sm max-w-none text-muted-foreground bg-accent/30 p-4 rounded-md">
                                          <p>{patient.aiResults.summary.briefing}</p>
                                      </div>
                                  </CardContent>
                              </Card>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                </Accordion>
            </TabsContent>

            <TabsContent value="integrated-analysis" className="mt-6">
                {patient.integratedAnalysisStatus === 'completed' && patient.integratedAnalysis ? (
                    <div className="space-y-6">
                       {patient.integratedAnalysis.requiresManualReview && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4"/>
                                <AlertTitle>مطلوب مراجعة يدوية</AlertTitle>
                                <AlertDescription>أشار الذكاء الاصطناعي إلى وجود تعارضات أو مستوى ثقة منخفض في هذا التحليل. يرجى المراجعة بعناية.</AlertDescription>
                            </Alert>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary">
                                    <Sparkles className="h-7 w-7" />
                                    <span>التحليل المتكامل وخطة العلاج</span>
                                </CardTitle>
                                <CardDescription>تم إنشاء هذا التحليل الموحد بواسطة NAWAB AI لحل التعارضات وتقديم خطة قابلة للتنفيذ.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Diagnosis */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-xl flex items-center gap-2"><BrainCircuit/> التشخيص الموحد</h3>
                                        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                            <p><strong className="font-medium text-foreground">التشخيص الأساسي:</strong> {patient.integratedAnalysis.integratedDiagnosis.primary.diagnosis}</p>
                                            {patient.integratedAnalysis.integratedDiagnosis.secondary.length > 0 && (
                                                 <p><strong className="font-medium text-foreground">التشخيصات الثانوية:</strong> {patient.integratedAnalysis.integratedDiagnosis.secondary.map(d => d.diagnosis).join(', ')}</p>
                                            )}
                                            <p><strong className="font-medium text-foreground">مستوى الثقة:</strong> <Badge>{(patient.integratedAnalysis.integratedDiagnosis.confidence * 100).toFixed(0)}%</Badge></p>
                                            <p><strong className="font-medium text-foreground">توافق النماذج:</strong> <Badge variant="secondary">{patient.integratedAnalysis.integratedDiagnosis.consensus}</Badge></p>
                                        </div>
                                    </div>
                                    {/* Treatment Plan */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-xl flex items-center gap-2"><ClipboardList/> خطة العلاج</h3>
                                        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                             <div>
                                                <h4 className="font-semibold text-base flex items-center gap-2 mb-1"><Pill/> العلاج الدوائي</h4>
                                                <ul className="list-disc pl-5 text-sm space-y-1">
                                                    <li><strong>الخط الأول:</strong> {patient.integratedAnalysis.treatmentPlan.pharmacological.firstLine.join(', ') || 'لم يحدد'}</li>
                                                    <li><strong>الخط الثاني:</strong> {patient.integratedAnalysis.treatmentPlan.pharmacological.secondLine.join(', ') || 'لم يحدد'}</li>
                                                    <li><strong>موانع الاستعمال:</strong> {patient.integratedAnalysis.treatmentPlan.pharmacological.contraindicated.join(', ') || 'لا يوجد'}</li>
                                                </ul>
                                            </div>
                                            <Separator/>
                                            <div>
                                                <h4 className="font-semibold text-base flex items-center gap-2 mb-1"><FlaskConical/> العلاج النفسي</h4>
                                                <ul className="list-disc pl-5 text-sm space-y-1">
                                                    <li><strong>التوصية:</strong> {patient.integratedAnalysis.treatmentPlan.psychotherapeutic.recommended.join(', ') || 'لم يحدد'}</li>
                                                    <li><strong>المدة:</strong> {patient.integratedAnalysis.treatmentPlan.psychotherapeutic.duration || 'لم تحدد'}</li>
                                                    <li><strong>التكرار:</strong> {patient.integratedAnalysis.treatmentPlan.psychotherapeutic.frequency || 'لم يحدد'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-xl flex items-center gap-2">المناقشة السريرية</h3>
                                    <p className="text-muted-foreground mt-2 bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">{patient.integratedAnalysis.clinicalDiscussion}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                     <Card className="border-dashed mt-6">
                        <CardHeader className="text-center">
                             <CardTitle className="flex items-center justify-center gap-3">
                                <Sparkles className="h-6 w-6 text-primary" />
                                <span>المرحلة التالية: التحليل المتكامل</span>
                            </CardTitle>
                            <CardDescription>
                               {patient.integratedAnalysisStatus === 'failed' ? 
                               'فشل التحليل الأخير. يرجى المحاولة مرة أخرى أو مراجعة الأخطاء.' : 
                               'دمج النتائج الأولية في تشخيص موحد وخطة علاجية.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Button onClick={handleRunAnalysis} disabled={isAnalyzing || !patient.aiResults} size="lg" className="h-12 text-lg">
                                 {isAnalyzing ? (
                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                 ) : (
                                    <Sparkles className="ml-2 h-5 w-5" />
                                 )}
                                {isAnalyzing ? 'جاري التحليل...' : 'تشغيل التحليل المتكامل'}
                            </Button>
                             {isAnalyzing && <p className="text-sm text-muted-foreground">قد تستغرق هذه العملية دقيقة أو دقيقتين...</p>}
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            
            <TabsContent value="discussion">
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>المناقشة مع النماذج</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">سيتم تطبيق هذه الميزة قريباً.</p>
                    </CardContent>
                 </Card>
            </TabsContent>

        </Tabs>
      </div>
    </>
  );
}

    