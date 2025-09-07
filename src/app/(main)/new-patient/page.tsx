
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SYMPTOM_CATEGORIES } from "@/lib/symptoms";
import { MEDICATION_CATEGORIES } from "@/lib/medications";
import { MultiSelect } from "@/components/ui/multi-select";
import { registerPatient } from "./actions";

const newPatientFormSchema = z.object({
  name: z.string().min(3, "يجب أن يتكون الاسم من 3 أحرف على الأقل."),
  age: z.coerce.number().min(1, "العمر مطلوب.").max(120, "يرجى إدخال عمر صحيح."),
  gender: z.string().min(1, "الجنس مطلوب."),
  patientHistory: z.string().min(20, "يرجى تقديم نبذة تاريخية لا تقل عن 20 حرفًا."),
  symptoms: z.array(z.string()).min(3, "الرجاء اختيار 3 أعراض على الأقل.").max(10, "الرجاء اختيار 10 أعراض على الأكثر."),
  currentMedications: z.array(z.string()).optional(),
  addictionHistory: z.boolean().default(false),
  addictionDetails: z.string().optional(),
  familyHistory: z.boolean().default(false),
  familyHistoryDetails: z.string().optional(),
}).refine(data => !data.addictionHistory || (data.addictionHistory && data.addictionDetails && data.addictionDetails.length > 0), {
    message: "يرجى تقديم تفاصيل عن تاريخ الإدمان.",
    path: ["addictionDetails"],
}).refine(data => !data.familyHistory || (data.familyHistory && data.familyHistoryDetails && data.familyHistoryDetails.length > 0), {
    message: "يرجى تقديم تفاصيل عن التاريخ العائلي.",
    path: ["familyHistoryDetails"],
});

export default function NewPatientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof newPatientFormSchema>>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: {
      name: "",
      age: "" as any,
      gender: "",
      patientHistory: "",
      symptoms: [],
      currentMedications: [],
      addictionHistory: false,
      addictionDetails: "",
      familyHistory: false,
      familyHistoryDetails: "",
    },
  });
  
  const watchAddictionHistory = form.watch("addictionHistory");
  const watchFamilyHistory = form.watch("familyHistory");

  const symptomOptions = SYMPTOM_CATEGORIES.flatMap(category =>
    category.symptoms.map(symptom => ({
      value: symptom,
      label: symptom,
      group: category.name,
    }))
  );

  const medicationOptions = MEDICATION_CATEGORIES.flatMap(category =>
    category.medications.map(medication => ({
      value: medication,
      label: medication,
      group: category.name,
    }))
  );

  async function onSubmit(values: z.infer<typeof newPatientFormSchema>) {
    setIsLoading(true);
    
    const response = await registerPatient(values);
    
    setIsLoading(false);

    if (response.success) {
        toast({
            title: "تم تسجيل المريض بنجاح",
            description: `تم إنشاء ملف للمريض ${values.name} برقم: ${response.patientId}. يتم الآن تحليل البيانات بواسطة وكلاء الذكاء الاصطناعي.`,
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

  return (
    <>
      <PageHeader
        title="إدخال مريض جديد"
        description="أدخل البيانات الأولية للمريض لتفعيل وكلاء الذكاء الاصطناعي."
      />
      <div className="grid gap-8 justify-center">
        <div className="w-full max-w-4xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus />
                    <span>بيانات المريض الأساسية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل للمريض</FormLabel>
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
                          <FormLabel>العمر</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="مثال: 35" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الجنس</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-base">
                                  <SelectValue placeholder="اختر الجنس..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ذكر">ذكر</SelectItem>
                                <SelectItem value="أنثى">أنثى</SelectItem>
                                <SelectItem value="غير محدد">غير محدد</SelectItem>
                              </SelectContent>
                            </Select>
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
                          <FormLabel>تاريخ مرضي مختصر (3-5 أسطر)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل نبذة مختصرة عن التاريخ الطبي والنفسي للمريض..."
                              className="min-h-[120px] text-base"
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
                        <FormLabel>الأعراض الرئيسية (3-10 أعراض)</FormLabel>
                        <FormControl>
                           <MultiSelect
                            options={symptomOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="ابحث أو اختر الأعراض..."
                            className="text-base"
                           />
                        </FormControl>
                        <FormDescription>حدد الأعراض الرئيسية التي يشتكي منها المريض حاليًا.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأدوية السابقة/الحالية (اختياري)</FormLabel>
                        <FormControl>
                           <MultiSelect
                            options={medicationOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder="ابحث أو اختر الأدوية..."
                            className="text-base"
                           />
                        </FormControl>
                         <FormDescription>يمكنك اختيار أدوية متعددة من القائمة.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <FormField
                        control={form.control}
                        name="addictionHistory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">علامات إدمان سابقة/حالية؟</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {watchAddictionHistory && (
                        <FormField
                            control={form.control}
                            name="addictionDetails"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>تفاصيل الإدمان</FormLabel>
                                <FormControl>
                                <Input placeholder="مثال: تاريخ تعاطي الكحول لمدة 5 سنوات" {...field} className="text-base"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      )}
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <FormField
                        control={form.control}
                        name="familyHistory"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">تاريخ عائلي لأمراض نفسية؟</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {watchFamilyHistory && (
                         <FormField
                            control={form.control}
                            name="familyHistoryDetails"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>تفاصيل التاريخ العائلي</FormLabel>
                                <FormControl>
                                <Input placeholder="مثال: الأم مشخصة باضطراب ثنائي القطب" {...field} className="text-base"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      )}
                  </div>

                </CardContent>
              </Card>

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-xl font-bold">
                {isLoading ? (
                  <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="ml-2 h-6 w-6" />
                )}
                تفعيل NAWAB AI
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
