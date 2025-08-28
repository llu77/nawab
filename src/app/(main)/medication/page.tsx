"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Pill } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { suggestAlternatives } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { AlternativeMedicationsOutput } from "@/ai/flows/medication-alternatives";

const medicationFormSchema = z.object({
  patientHistory: z.string().min(20, "Please provide a more detailed patient history."),
  patientGenetics: z.string().optional(),
  currentMedications: z.string().min(3, "Please list at least one current medication."),
});

export default function MedicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AlternativeMedicationsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof medicationFormSchema>>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      patientHistory: "",
      patientGenetics: "",
      currentMedications: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicationFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const response = await suggestAlternatives({
      patientHistory: values.patientHistory,
      patientGenetics: values.patientGenetics || "Not provided",
      currentMedications: values.currentMedications,
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
        title="أداة الأدوية الشخصية"
        description="اقتراح أدوية بديلة مع مراعاة تاريخ المريض والجينات والوصفات الطبية الحالية."
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
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأدوية الحالية</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: Sertraline 50mg, Lorazepam 1mg" {...field} />
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
                        <FormLabel>تاريخ المريض الطبي</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: تم تشخيصه باضطراب اكتئابي كبير، تاريخ من ارتفاع ضغط الدم..."
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
                    name="patientGenetics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>جينات المريض (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: CYP2D6 poor metabolizer, MTHFR mutation..."
                            className="min-h-[100px]"
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="ml-2 h-4 w-4" />
                    )}
                    اقتراح البدائل
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>الأدوية البديلة المقترحة</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">يقوم الذكاء الاصطناعي بالبحث عن بدائل...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-4 bg-accent/50 rounded-full">
                    <Pill className="h-10 w-10 text-primary" />
                  </div>
                  <p className="mt-4 text-muted-foreground">ستظهر بدائل الأدوية المقترحة هنا.</p>
                </div>
              )}
              {result && (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                  <pre className="whitespace-pre-wrap font-body text-sm bg-muted/50 p-4 rounded-md">{result.alternatives}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
