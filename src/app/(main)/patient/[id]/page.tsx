
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
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPatientData } from "./actions";
import type { OrchestratorOutput } from "@/ai/flows/schemas";

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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      const response = await getPatientData(params.id);
      if (response.success) {
        // We cast because the server action now returns a proper PatientData type
        setPatient(response.data as PatientData);
      } else {
        setError(response.error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);

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
  
  return (
    <>
      <PageHeader
        title={patient.name}
        description={`ملف المريض رقم: ${patient.patientId}`}
        className="mb-6"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">
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

          {patient.aiResults?.diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6" />
                  <span>الفرضيات التشخيصية (بواسطة AI)</span>
                </CardTitle>
                <CardDescription>
                  تحليل أولي بناءً على المعلومات المقدمة ومعايير DSM-5.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {patient.aiResults.diagnosis.diagnosisHypotheses.map((hypothesis, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg hover:no-underline">
                          <div className="flex items-center gap-4 w-full">
                            <span className="font-semibold">{hypothesis.diagnosis}</span>
                            <Badge variant={hypothesis.confidence > 0.7 ? "default" : "secondary"} className="text-sm">
                              {`الثقة: ${(hypothesis.confidence * 100).toFixed(0)}%`}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 px-2 text-base">
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
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6" />
                        <span>تنبؤات المخاطر (بواسطة AI)</span>
                    </CardTitle>
                    <CardDescription>
                        تقييم أولي لاحتمالية الانتكاس.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-base font-medium text-muted-foreground">احتمالية الانتكاس</p>
                        <p className="text-6xl font-bold font-headline mt-1">
                        {patient.aiResults.relapsePrediction.relapseProbability.toFixed(1)}%
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                        <span className={`px-4 py-1.5 text-base font-semibold rounded-full text-white ${getRiskColor(patient.aiResults.relapsePrediction.relapseProbability)}`}>
                            خطر {getRiskLevel(patient.aiResults.relapsePrediction.relapseProbability)}
                        </span>
                        </div>
                    </div>
                    <div className="w-full px-2">
                        <Progress value={patient.aiResults.relapsePrediction.relapseProbability} className="h-2.5 [&>div]:bg-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-base mb-1">الأساس المنطقي</h4>
                        <p className="text-base text-muted-foreground bg-accent/30 p-3 rounded-md">{patient.aiResults.relapsePrediction.rationale}</p>
                    </div>
                </CardContent>
                </Card>
            )}
            {patient.aiResults?.summary && (
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        <span>ملخص الذكاء الاصطناعي</span>
                    </CardTitle>
                    <CardDescription>
                        ملخص شامل تم إنشاؤه بواسطة AI للحالة الأولية للمريض.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-base max-w-none text-muted-foreground bg-accent/30 p-4 rounded-md">
                            <p>{patient.aiResults.summary.summary}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
