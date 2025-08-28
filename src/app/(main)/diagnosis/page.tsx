
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, BrainCircuit, PlusCircle } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDiagnosis } from "./actions";
import { PageHeader } from "@/components/page-header";
import { SYMPTOM_CATEGORIES } from "@/lib/symptoms";
import type { DiagnosePatientOutput } from "@/ai/flows/diagnosis-assistant";

const diagnosisFormSchema = z.object({
  patientHistory: z.string().min(50, "Please provide a more detailed patient history (at least 50 characters)."),
  sessionNotes: z.string().min(100, "Please provide more detailed session notes (at least 100 characters)."),
  symptoms: z.array(z.object({ value: z.string().min(1, "الرجاء اختيار عرض.") })).min(3, "Please select at least 3 symptoms.").max(10, "Please select no more than 10 symptoms."),
});

export default function DiagnosisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosePatientOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof diagnosisFormSchema>>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      patientHistory: "",
      sessionNotes: "",
      symptoms: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "symptoms",
  });


  async function onSubmit(values: z.infer<typeof diagnosisFormSchema>) {
    setIsLoading(true);
    setResult(null);
    
    const symptomValues = values.symptoms.map(s => s.value).filter(Boolean);
    const sessionNotesArray = values.sessionNotes.split('\n').filter(note => note.trim() !== '');
    
    const enrichedPatientHistory = `${values.patientHistory}\n\nSelected Symptoms:\n- ${symptomValues.join('\n- ')}`;

    const response = await getDiagnosis({
        patientHistory: enrichedPatientHistory,
        sessionNotes: sessionNotesArray
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

  return (
    <>
      <PageHeader
        title="مساعد التشخيص بالذكاء الاصطناعي"
        description="تحليل ملاحظات الجلسة وتاريخ المريض لتوليد فرضيات تشخيصية بناءً على معايير DSM-5."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>بيانات المريض</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="patientHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ المريض</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: تاريخ من القلق، أدوية سابقة، تاريخ عائلي للأمراض النفسية..."
                            className="min-h-[150px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormLabel>الأعراض</FormLabel>
                    {fields.map((field, index) => (
                       <FormField
                        key={field.id}
                        control={form.control}
                        name={`symptoms.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="text-base">
                                  <SelectValue placeholder={`اختر العرض ${index + 1}...`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {SYMPTOM_CATEGORIES.map((category) => (
                                    <SelectGroup key={category.name}>
                                      <SelectLabel>{category.name}</SelectLabel>
                                      {category.symptoms.map((symptom) => (
                                        <SelectItem key={symptom} value={symptom}>
                                          {symptom}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => append({ value: "" })}
                    >
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة عرض
                    </Button>
                    <FormDescription>اختر من 3 إلى 10 أعراض لوصف حالة المريض.</FormDescription>
                     {form.formState.errors.symptoms && <p className="text-sm font-medium text-destructive">{form.formState.errors.symptoms.message}</p>}
                  </div>

                  <FormField
                    control={form.control}
                    name="sessionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات الجلسة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل ملاحظات الجلسة التفصيلية هنا. كل ملاحظة في سطر جديد."
                            className="min-h-[250px] text-base"
                            {...field}
                          />
                        </FormControl>
                         <FormDescription>افصل الملاحظات الفردية أو المشاهدات بسطر جديد.</FormDescription>
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
                    إنشاء التشخيص
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>الفرضيات التشخيصية</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">يقوم الذكاء الاصطناعي بتحليل البيانات...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-5 bg-accent/50 rounded-full">
                    <BrainCircuit className="h-12 w-12 text-primary" />
                  </div>
                  <p className="mt-6 text-lg text-muted-foreground max-w-sm">ستظهر هنا الرؤى التشخيصية التي تم إنشاؤها بواسطة الذكاء الاصطناعي.</p>
                </div>
              )}
              {result && (
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                  {result.diagnosisHypotheses.map((hypothesis, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-lg">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{hypothesis.diagnosis}</span>
                          <Badge variant={hypothesis.confidence > 0.7 ? "default" : "secondary"} className="text-sm">
                            {`الثقة: ${(hypothesis.confidence * 100).toFixed(0)}%`}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-2">
                        <div>
                          <h4 className="font-semibold text-base mb-1">المنطق (معايير DSM-5)</h4>
                          <p className="text-base text-muted-foreground">{hypothesis.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-base mb-1">الأدلة الداعمة</h4>
                          <p className="text-base text-muted-foreground">{hypothesis.supportingEvidence}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
