
"use client";

import {
  BrainCircuit,
  FileText,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";

// Dummy data - In a real application, you would fetch this data based on the `params.id`
const patientData = {
  id: "728ed52f",
  name: "John Doe",
  age: 35,
  gender: "Male",
  registrationDate: "2024-01-15",
  patientId: "PSY-20240115-A8B3D",
  initialSummary: {
    briefHistory: "Patient reports a 6-month history of persistent low mood, anhedonia, and difficulty concentrating. Reports significant stress at work. No previous psychiatric hospitalizations.",
    symptoms: ["Depressed Mood", "Anhedonia", "Concentration Deficit", "Fatigue", "Insomnia"],
    previousMedications: ["Zoloft (Sertraline) 50mg - discontinued due to side effects"],
    addictionHistory: "No history of substance abuse.",
    familyHistory: "Mother has a history of depression.",
  },
  diagnosisHypotheses: [
    {
      diagnosis: "Major Depressive Disorder, Single Episode, Moderate",
      confidence: 0.85,
      reasoning: "Patient meets 5 of the 9 DSM-5 criteria, including depressed mood and anhedonia, for more than two weeks. The symptoms cause clinically significant distress in social and occupational functioning.",
      supportingEvidence: "Persistent low mood, anhedonia, fatigue, insomnia, and concentration deficit reported by the patient. History of stress at work is a contributing factor.",
    },
    {
      diagnosis: "Adjustment Disorder with Depressed Mood",
      confidence: 0.6,
      reasoning: "The onset of symptoms is linked to a specific stressor (work stress). However, the number and severity of symptoms may exceed what is typical for an adjustment disorder.",
      supportingEvidence: "Temporal relationship between work stress and onset of symptoms.",
    },
  ],
  relapsePrediction: {
    relapseProbability: 35,
    rationale: "Patient has several protective factors, including no history of substance abuse and a stated willingness to engage in therapy. However, the presence of insomnia and a family history of depression are considered risk factors. Close monitoring of sleep patterns is recommended.",
  },
  aiSummary: "John Doe is a 35-year-old male presenting with primary symptoms of depression, including low mood, anhedonia, and concentration difficulties, which are impacting his occupational functioning. The symptoms have been present for 6 months and are linked to work-related stress. Family history is positive for depression. The leading diagnostic hypothesis is Major Depressive Disorder. The initial risk of relapse is estimated to be low-to-moderate, with key risk factors being insomnia and family history.",
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
  // In a real app, you'd use `params.id` to fetch the patient's data
  // For now, we'll use the dummy data.
  const patient = patientData;

  return (
    <>
      <PageHeader
        title={patient.name}
        description={`ملف المريض رقم: ${patient.patientId}`}
        className="mb-6"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">
          {/* Patient Summary Card */}
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
                <p className="text-muted-foreground">{patient.initialSummary.briefHistory}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Stethoscope className="h-5 w-5 text-primary"/>الأعراض الرئيسية</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.initialSummary.symptoms.map(symptom => (
                        <Badge key={symptom} variant="secondary">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                   <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Pill className="h-5 w-5 text-primary"/>الأدوية السابقة</h4>
                    <p className="text-muted-foreground">{patient.initialSummary.previousMedications}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><HeartPulse className="h-5 w-5 text-primary"/>التاريخ الشخصي والعائلي</h4>
                     <p className="text-muted-foreground"><strong className="font-medium text-foreground">تاريخ الإدمان:</strong> {patient.initialSummary.addictionHistory}</p>
                     <p className="text-muted-foreground"><strong className="font-medium text-foreground">التاريخ العائلي:</strong> {patient.initialSummary.familyHistory}</p>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Hypotheses */}
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
                  {patient.diagnosisHypotheses.map((hypothesis, index) => (
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

          <div className="grid gap-6 md:grid-cols-2">
             {/* Risk Prediction */}
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
                      {patient.relapsePrediction.relapseProbability.toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className={`px-4 py-1.5 text-base font-semibold rounded-full text-white ${getRiskColor(patient.relapsePrediction.relapseProbability)}`}>
                        خطر {getRiskLevel(patient.relapsePrediction.relapseProbability)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full px-2">
                    <Progress value={patient.relapsePrediction.relapseProbability} className="h-2.5 [&>div]:bg-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">الأساس المنطقي</h4>
                    <p className="text-base text-muted-foreground bg-accent/30 p-3 rounded-md">{patient.relapsePrediction.rationale}</p>
                  </div>
              </CardContent>
            </Card>
             {/* AI Summary */}
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
                        <p>{patient.aiSummary}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
