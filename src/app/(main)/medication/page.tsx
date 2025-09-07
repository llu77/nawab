
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Pill, AlertTriangle, FlaskConical, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { suggestAlternatives } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { MedicationAnalysisOutput } from "@/ai/flows/schemas";
import { MEDICATION_CATEGORIES } from "@/lib/medications";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const medicationFormSchema = z.object({
  patientHistory: z.string().min(20, "Please provide a more detailed patient history."),
  patientGenetics: z.string().optional(),
  currentMedication: z.string().min(1, "Please select at least one medication."),
});

export default function MedicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedicationAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof medicationFormSchema>>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      patientHistory: "",
      patientGenetics: "",
      currentMedication: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicationFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const response = await suggestAlternatives({
      patientHistory: values.patientHistory,
      patientGenetics: values.patientGenetics || "Not provided",
      currentMedications: values.currentMedication,
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

  const getInteractionSeverityBadge = (severity: string) => {
    switch (severity) {
      case "major":
      case "contraindicated":
        return "destructive";
      case "moderate":
        return "secondary";
      default:
        return "outline";
    }
  }

  return (
    <>
      <PageHeader
        title="أداة الأدوية الشخصية"
        description="مراجعة شاملة للأدوية، تحليل التفاعلات، واقتراح بدائل آمنة بناءً على ملف المريض."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المريض</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentMedication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدواء الحالي</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-base">
                                <SelectValue placeholder="اختر الدواء الحالي..."/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEDICATION_CATEGORIES.map((category) => (
                                <optgroup label={category.name} key={category.name} className="font-semibold p-2">
                                  {category.medications.map((medication) => (
                                    <SelectItem key={medication} value={medication} className="font-normal">
                                      {medication}
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
                    name="patientHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ المريض الطبي</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: تم تشخيصه باضطراب اكتئابي كبير، تاريخ من ارتفاع ضغط الدم..."
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
                    name="patientGenetics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>جينات المريض (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: CYP2D6 poor metabolizer, MTHFR mutation..."
                            className="min-h-[100px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          توفير بيانات علم الوراثة الدوائي إذا كانت متاحة للحصول على نتائج أكثر تخصيصًا.
                        </FormDescription>
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
                    تحليل الأدوية
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>مراجعة الصيدلي الإكلينيكي</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">يقوم الذكاء الاصطناعي بتحليل الأدوية...</p>
                </div>
              )}
              {!isLoading && !result && (
                 <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-5 bg-accent/50 rounded-full">
                    <Pill className="h-12 w-12 text-primary" />
                  </div>
                  <p className="mt-6 text-lg text-muted-foreground max-w-sm">ستظهر هنا مراجعة الأدوية والبدائل المقترحة.</p>
                </div>
              )}
              {result && (
                <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full space-y-4">
                  
                  <Card>
                    <AccordionItem value="item-1" className="border-0">
                      <AccordionTrigger className="p-4 text-lg font-semibold">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-6 w-6 text-yellow-500" />
                          <span>التفاعلات الدوائية المحتملة</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {result.drugInteractions.length > 0 ? (
                          <div className="space-y-4">
                            {result.drugInteractions.map((interaction, index) => (
                              <div key={index} className="p-3 bg-muted/50 rounded-md">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold text-base">
                                    {interaction.drug1} + {interaction.drug2}
                                  </p>
                                  <Badge variant={getInteractionSeverityBadge(interaction.severity)}>{interaction.severity}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">الأهمية السريرية:</strong> {interaction.clinicalSignificance}</p>
                                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">التوصية:</strong> {interaction.recommendation}</p>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-muted-foreground">لم يتم الكشف عن أي تفاعلات دوائية كبيرة.</p>}
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                  
                  <Card>
                    <AccordionItem value="item-2" className="border-0">
                      <AccordionTrigger className="p-4 text-lg font-semibold">
                        <div className="flex items-center gap-3">
                          <Pill className="h-6 w-6 text-blue-500" />
                          <span>البدائل الدوائية المقترحة</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                         {result.alternatives.length > 0 ? (
                          <div className="space-y-4">
                            {result.alternatives.map((alt, index) => (
                              <div key={index} className="p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold text-base">{alt.medication}</p>
                                <p className="text-sm text-muted-foreground mt-1">{alt.rationale}</p>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-muted-foreground">لا توجد بدائل مقترحة حالياً.</p>}
                      </AccordionContent>
                    </AccordionItem>
                  </Card>

                  <Card>
                    <AccordionItem value="item-3" className="border-0">
                       <AccordionTrigger className="p-4 text-lg font-semibold">
                        <div className="flex items-center gap-3">
                          <FlaskConical className="h-6 w-6 text-green-500" />
                           <span>خطة المراقبة والتعديلات</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-4">
                          <div>
                            <h4 className="font-semibold text-base mb-2 flex items-center gap-2"><Stethoscope/> تعديلات الجرعة المقترحة</h4>
                            {result.medicationReview.adjustments.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {result.medicationReview.adjustments.map((adj, i) => (
                                  <li key={i}><strong>{adj.medication}:</strong> {adj.recommendation} ({adj.rationale})</li>
                                ))}
                              </ul>
                            ) : <p className="text-muted-foreground">لا توجد تعديلات مقترحة للجرعات الحالية.</p>}
                          </div>
                          <Separator/>
                          <div>
                            <h4 className="font-semibold text-base mb-2 flex items-center gap-2"><FlaskConical/> المراقبة السريرية والمخبرية</h4>
                            {result.monitoringPlan.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {result.monitoringPlan.map((plan, i) => (
                                  <li key={i}><strong>{plan.parameter}:</strong> {plan.frequency}</li>
                                ))}
                              </ul>
                            ) : <p className="text-muted-foreground">لا توجد خطة مراقبة محددة مطلوبة.</p>}
                          </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>

                   <Card>
                    <AccordionItem value="item-4" className="border-0">
                       <AccordionTrigger className="p-4 text-lg font-semibold">ملاحظات الصيدلي</AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-base text-muted-foreground whitespace-pre-wrap">{result.pharmacistNotes || "لا توجد ملاحظات إضافية."}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>

                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
