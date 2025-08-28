
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { suggestAlternatives } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { AlternativeMedicationsOutput } from "@/ai/flows/medication-alternatives";
import { MultiSelect } from "@/components/ui/multi-select";
import { MEDICATION_CATEGORIES } from "@/lib/medications";

const medicationFormSchema = z.object({
  patientHistory: z.string().min(20, "Please provide a more detailed patient history."),
  patientGenetics: z.string().optional(),
  currentMedications: z.array(z.string()).min(1, "Please select at least one medication."),
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
      currentMedications: [],
    },
  });

  async function onSubmit(values: z.infer<typeof medicationFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const response = await suggestAlternatives({
      patientHistory: values.patientHistory,
      patientGenetics: values.patientGenetics || "Not provided",
      currentMedications: values.currentMedications.join(', '),
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
  
  const medicationOptions = MEDICATION_CATEGORIES.flatMap(category =>
    category.medications.map(medication => ({
      value: medication,
      label: medication,
      group: category.name,
    }))
  );

  return (
    <>
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
                          <MultiSelect
                            options={medicationOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="اختر الأدوية الحالية..."
                            className="text-base"
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
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">يقوم الذكاء الاصطناعي بالبحث عن بدائل...</p>
                </div>
              )}
              {!isLoading && !result && (
                 <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-5 bg-accent/50 rounded-full">
                    <Pill className="h-12 w-12 text-primary" />
                  </div>
                  <p className="mt-6 text-lg text-muted-foreground max-w-sm">ستظهر بدائل الأدوية المقترحة هنا.</p>
                </div>
              )}
              {result && (
                <div className="prose prose-base max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                  <pre className="whitespace-pre-wrap font-body text-base bg-muted/50 p-4 rounded-md">{result.alternatives}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
