
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, UserPlus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { MultiSelect } from "@/components/ui/multi-select";
import { SYMPTOM_CATEGORIES } from "@/lib/symptoms";
import { registerPatient } from "./actions";

const newPatientFormSchema = z.object({
  name: z.string().min(3, "يجب أن يتكون الاسم من 3 أحرف على الأقل."),
  age: z.coerce.number().min(1, "العمر مطلوب.").max(120, "يرجى إدخال عمر صحيح."),
  patientHistory: z.string().min(20, "يرجى تقديم نبذة تاريخية لا تقل عن 20 حرفًا."),
  symptoms: z.array(z.string()).min(3, "الرجاء اختيار 3 أعراض على الأقل.").max(10, "الرجاء اختيار 10 أعراض على الأكثر."),
});

export default function NewPatientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof newPatientFormSchema>>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: {
      name: "",
      age: "" as any,
      patientHistory: "",
      symptoms: [],
    },
  });

  async function onSubmit(values: z.infer<typeof newPatientFormSchema>) {
    setIsLoading(true);
    
    // Here you would typically call a server action to register the patient
    // and activate the AI agents as per your design.
    console.log(values);
    
    const response = await registerPatient(values);
    
    setIsLoading(false);

    if (response.success) {
        toast({
            title: "تم تسجيل المريض بنجاح",
            description: `تم إنشاء ملف للمريض ${values.name} برقم: ${response.patientId}`,
        });
        form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: response.error,
        });
    }
  }
  
  const symptomOptions = SYMPTOM_CATEGORIES.flatMap(category => 
    category.symptoms.map(symptom => ({
      value: symptom,
      label: symptom,
      group: category.name,
    }))
  );

  return (
    <>
      <PageHeader
        title="إدخال مريض جديد"
        description="أدخل البيانات الأولية للمريض لتفعيل وكلاء الذكاء الاصطناعي."
      />
      <div className="grid gap-8 justify-center">
        <div className="w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus />
                <span>بيانات المريض الأساسية</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المريض</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: جون دو" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عمر المريض</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="مثال: 35" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                      control={form.control}
                      name="patientHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نبذة مختصرة عن تاريخ المريض</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل نبذة مختصرة عن التاريخ الطبي والنفسي للمريض (2-3 أسطر)..."
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
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأعراض الأولية</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={symptomOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="اختر من 3 إلى 10 أعراض..."
                            className="text-base"
                           />
                        </FormControl>
                         <FormDescription>حدد الأعراض الرئيسية التي يشتكي منها المريض حاليًا.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg font-bold">
                    {isLoading ? (
                      <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                    ) : (
                      <Sparkles className="ml-2 h-6 w-6" />
                    )}
                    حفظ وتفعيل وكلاء NAWAB AI
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
