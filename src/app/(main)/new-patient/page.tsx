
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePatientId } from "@/utils/id-generator";
import { Separator } from "@/components/ui/separator";
import { SYMPTOM_CATEGORIES } from "@/lib/symptoms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Zod schema for validation
const assessmentSchema = z.object({
  name: z.string().optional(),
  age: z.coerce.number({ invalid_type_error: "يجب أن يكون العمر رقمًا" }).min(1, "العمر مطلوب"),
  gender: z.enum(["male", "female"], {
    required_error: "يجب تحديد الجنس",
  }),
  mainSymptom: z.string().min(1, "يجب اختيار عرض رئيسي واحد على الأقل"),
  hasSubstanceUse: z.boolean().default(false),
  substanceDetails: z.string().optional(),
  hasMedicationHistory: z.boolean().default(false),
  medicationDetails: z.string().optional(),
  hasFamilyHistory: z.boolean().default(false),
  familyHistoryDetails: z.string().optional(),
});


export default function NewPatientPage() {
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    setPatientId(generatePatientId());
  }, []);

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
        name: "",
        age: undefined,
        gender: undefined,
        mainSymptom: "",
        hasSubstanceUse: false,
        substanceDetails: "",
        hasMedicationHistory: false,
        medicationDetails: "",
        hasFamilyHistory: false,
        familyHistoryDetails: "",
    }
  });

  function onSubmit(values: z.infer<typeof assessmentSchema>) {
    console.log("Assessment data submitted:", values);
    // Here you would typically send the data to your backend/AI agents
  }

  return (
    <>
      <PageHeader
        title="تقييم مريض جديد"
        description="يرجى إكمال النموذج التالي لبدء عملية التحليل بواسطة الذكاء الاصطناعي."
      />
      <div className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">البيانات الأساسية</CardTitle>
                <p className="text-sm text-muted-foreground">معرف المريض: <span className="font-mono font-bold text-primary">{patientId}</span></p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المريض (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: أحمد عبدالله" {...field} />
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
                          <Input type="number" placeholder="العمر بالسنوات" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4 pt-2"
                            dir="rtl"
                            >
                            <FormItem className="flex items-center space-x-2 space-x-reverse">
                                <FormControl>
                                <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">ذكر</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-x-reverse">
                                <FormControl>
                                <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">أنثى</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">الأعراض الرئيسية</CardTitle>
                    <p className="text-sm text-muted-foreground">اختر العرض الأكثر إلحاحًا الذي يواجهه المريض.</p>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="mainSymptom"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>العرض الرئيسي</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر من قائمة الأعراض..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {SYMPTOM_CATEGORIES.map((category) => (
                                <div key={category.name}>
                                    <p className="font-bold px-2 py-1 text-right">{category.name}</p>
                                    {category.symptoms.map((symptom) => (
                                    <SelectItem key={symptom} value={symptom}>
                                        {symptom}
                                    </SelectItem>
                                    ))}
                                </div>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">التاريخ الطبي</CardTitle>
                    <p className="text-sm text-muted-foreground">أجب عن الأسئلة التالية للمساعدة في دقة التحليل.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Substance Use */}
                     <FormField
                        control={form.control}
                        name="hasSubstanceUse"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">هل يستخدم المريض أي مواد إدمانية؟</FormLabel>
                            <FormDescription>
                                يشمل الكحول، التبغ، أو أي مواد أخرى.
                            </FormDescription>
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
                    {form.watch("hasSubstanceUse") && (
                         <FormField
                            control={form.control}
                            name="substanceDetails"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>اذكر تفاصيل المواد المستخدمة</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="مثال: تدخين التبغ لمدة 5 سنوات، توقف منذ 6 أشهر."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                    <Separator />
                    
                    {/* Medication History */}
                    <FormField
                        control={form.control}
                        name="hasMedicationHistory"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">هل يتناول المريض أدوية نفسية حالياً أو سابقاً؟</FormLabel>
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
                     {form.watch("hasMedicationHistory") && (
                         <FormField
                            control={form.control}
                            name="medicationDetails"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>اذكر الأدوية، الجرعات، والمدة</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="مثال: Zoloft 50mg لمدة سنة، توقف بسبب الآثار الجانبية."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                    <Separator />

                    {/* Family History */}
                    <FormField
                        control={form.control}
                        name="hasFamilyHistory"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">هل يوجد تاريخ مرضي نفسي في العائلة؟</FormLabel>
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
                    {form.watch("hasFamilyHistory") && (
                         <FormField
                            control={form.control}
                            name="familyHistoryDetails"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>اذكر تفاصيل التاريخ العائلي وصلة القرابة</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="مثال: الأب يعاني من الاكتئاب، الأخت تعاني من القلق."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                </CardContent>
            </Card>


            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                    بدء التحليل بواسطة AI
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

    