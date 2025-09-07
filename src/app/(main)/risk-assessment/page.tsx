
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getRelapsePrediction } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { RelapsePredictionOutput } from "@/ai/flows/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIAGNOSIS_CATEGORIES } from "@/lib/diagnoses";

const riskFormSchema = z.object({
  expectedDiagnosis: z.string().min(1, "Please select an expected diagnosis."),
  behavioralPatterns: z.string().min(100, "Please provide detailed behavioral patterns (at least 100 characters)."),
  patientHistory: z.string().min(50, "Please provide patient history (at least 50 characters)."),
  riskFactors: z.string().min(20, "Please list relevant risk factors."),
});

export default function RiskAssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RelapsePredictionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      expectedDiagnosis: "",
      behavioralPatterns: "",
      patientHistory: "",
      riskFactors: "",
    },
  });

  async function onSubmit(values: z.infer<typeof riskFormSchema>) {
    setIsLoading(true);
    setResult(null);

    // Enrich history with expected diagnosis if provided
    const patientHistory = `${values.patientHistory}\n\nExpected Diagnosis: ${values.expectedDiagnosis}`;

    const response = await getRelapsePrediction({
      behavioralPatterns: values.behavioralPatterns,
      patientHistory: patientHistory,
      riskFactors: values.riskFactors
    });

    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

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

  return (
    <>
      <PageHeader
        title="أداة التنبؤ بالمخاطر"
        description="بناءً على الأنماط السلوكية، توقع احتمالية انتكاس المريض لتعديل خطط الرعاية والعلاج."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات المريض</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="expectedDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التشخيص المتوقع</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-base">
                              <SelectValue placeholder="اختر التشخيص المتوقع..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIAGNOSIS_CATEGORIES.map((category) => (
                                <optgroup label={category.name} key={category.name} className="font-semibold p-2">
                                  {category.diagnoses.map((diagnosis) => (
                                    <SelectItem key={diagnosis} value={diagnosis} className="font-normal">
                                      {diagnosis}
                                    </SelectItem>
                                  ))}
                                </optgroup>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="behavioralPatterns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأنماط السلوكية</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: زيادة الانسحاب الاجتماعي، تغيرات في أنماط النوم، تفويت المواعيد..."
                            className="min-h-[150px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ المريض ذو الصلة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: أحداث الانتكاس السابقة، الالتزام بالعلاجات السابقة..."
                            className="min-h-[100px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riskFactors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عوامل الخطر المعروفة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: نقص الدعم الاجتماعي، حدث حياة مرهق حديث، تعاطي المخدرات..."
                            className="min-h-[100px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full h-11 text-base">
                    {isLoading ? (
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="ml-2 h-5 w-5" />
                    )}
                    توقع مخاطر الانتكاس
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>التنبؤ بالانتكاس</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">يقوم الذكاء الاصطناعي بحساب احتمالية الانتكاس...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-5 bg-accent/50 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                  </div>
                  <p className="mt-6 text-lg text-muted-foreground max-w-sm">سيظهر هنا توقع مخاطر انتكاس المريض.</p>
                </div>
              )}
              {result && (
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-base font-medium text-muted-foreground">احتمالية الانتكاس</p>
                    <p className="text-7xl font-bold font-headline mt-2">
                      {result.relapseProbability.toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <span className={`px-4 py-1.5 text-base font-semibold rounded-full text-white ${getRiskColor(result.relapseProbability)}`}>
                        خطر {getRiskLevel(result.relapseProbability)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <Progress value={result.relapseProbability} className="h-3 [&>div]:bg-primary" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>منخفض</span>
                      <span>متوسط</span>
                      <span>مرتفع</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">الأساس المنطقي</h4>
                    <p className="text-base text-muted-foreground bg-accent/50 p-4 rounded-lg">{result.rationale}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
