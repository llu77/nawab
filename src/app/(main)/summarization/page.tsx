
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, FileText, Lightbulb, AlertTriangle, CheckSquare } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { createSummary } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { SummaryOutput } from "@/ai/flows/schemas";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const summaryFormSchema = z.object({
  patientData: z.string().min(50, "Please provide more detailed patient data (at least 50 characters)."),
  sessionNotes: z.string().min(100, "Please provide more detailed session notes (at least 100 characters)."),
});

export default function SummarizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof summaryFormSchema>>({
    resolver: zodResolver(summaryFormSchema),
    defaultValues: {
      patientData: "",
      sessionNotes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof summaryFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const response = await createSummary(values);

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

  const getAlertBadgeVariant = (urgency: string) => {
    switch(urgency) {
      case 'stat':
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  return (
    <>
      <PageHeader
        title="مولد الملخصات التنفيذية"
        description="إنشاء ملخصات سريرية شاملة وقابلة للتنفيذ للمراجعة السريعة واتخاذ القرار."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>النص المصدر</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="patientData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بيانات المريض</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: التركيبة السكانية، التشخيص، قائمة الأدوية، الحساسية..."
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
                    name="sessionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات الجلسة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="الصق ملاحظة جلسة حديثة أو أكثر هنا..."
                            className="min-h-[250px] text-base"
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
                    إنشاء ملخص تنفيذي
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>الملخص التنفيذي</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">يقوم الذكاء الاصطناعي بتلخيص النص...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-5 bg-accent/50 rounded-full">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                   <p className="mt-6 text-lg text-muted-foreground max-w-sm">سيظهر الملخص التنفيذي الذي تم إنشاؤه هنا.</p>
                </div>
              )}
              {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">موجز الحالة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-muted-foreground">{result.briefing}</p>
                        </CardContent>
                    </Card>

                    {result.criticalAlerts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 text-destructive"><AlertTriangle/> تنبيهات حرجة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {result.criticalAlerts.map((alert, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 bg-destructive/10 rounded-md">
                                        <Badge variant={getAlertBadgeVariant(alert.urgency)}>{alert.urgency}</Badge>
                                        <p className="text-sm text-destructive-foreground font-medium">{alert.message}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2"><CheckSquare/> نقاط رئيسية</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
                                    {result.keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2"><Lightbulb/> توصيات عملية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">أسئلة مقترحة للمريض:</h4>
                                    <ul className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                        {result.suggestedQuestions.map((q, index) => <li key={index}>{q}</li>)}
                                    </ul>
                                </div>
                                <Separator />
                                 <div>
                                    <h4 className="font-semibold mb-2">قرارات معلقة:</h4>
                                    <ul className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                        {result.pendingDecisions.map((d, index) => <li key={index}>{d}</li>)}
                                    </ul>
                                 </div>
                            </CardContent>
                        </Card>
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
