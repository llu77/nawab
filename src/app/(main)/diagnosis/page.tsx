"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, BrainCircuit } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { getDiagnosis } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { DiagnosePatientOutput } from "@/ai/flows/diagnosis-assistant";

const diagnosisFormSchema = z.object({
  patientHistory: z.string().min(50, "Please provide a more detailed patient history (at least 50 characters)."),
  sessionNotes: z.string().min(100, "Please provide more detailed session notes (at least 100 characters)."),
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
    },
  });

  async function onSubmit(values: z.infer<typeof diagnosisFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const sessionNotesArray = values.sessionNotes.split('\n').filter(note => note.trim() !== '');
    
    const response = await getDiagnosis({
        patientHistory: values.patientHistory,
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
    <div className="flex flex-col gap-8">
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
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sessionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات الجلسة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل ملاحظات الجلسة التفصيلية هنا. كل ملاحظة في سطر جديد."
                            className="min-h-[250px]"
                            {...field}
                          />
                        </FormControl>
                         <FormDescription>افصل الملاحظات الفردية أو المشاهدات بسطر جديد.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="ml-2 h-4 w-4" />
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
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">يقوم الذكاء الاصطناعي بتحليل البيانات...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-4 bg-accent/50 rounded-full">
                    <BrainCircuit className="h-10 w-10 text-primary" />
                  </div>
                  <p className="mt-4 text-muted-foreground">ستظهر هنا الرؤى التشخيصية التي تم إنشاؤها بواسطة الذكاء الاصطناعي.</p>
                </div>
              )}
              {result && (
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                  {result.diagnosisHypotheses.map((hypothesis, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-base">{hypothesis.diagnosis}</span>
                          <Badge variant={hypothesis.confidence > 0.7 ? "default" : "secondary"}>
                            {`الثقة: ${(hypothesis.confidence * 100).toFixed(0)}%`}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-2">
                        <div>
                          <h4 className="font-semibold mb-1">المنطق (معايير DSM-5)</h4>
                          <p className="text-sm text-muted-foreground">{hypothesis.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">الأدلة الداعمة</h4>
                          <p className="text-sm text-muted-foreground">{hypothesis.supportingEvidence}</p>
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
    </div>
  );
}
