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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { runOrchestratorAction } from "@/app/actions";
import { OrchestratorInputSchema } from "@/ai/flows/schemas";

// This client-side schema is now derived from the main OrchestratorInputSchema
// but with client-specific refinements for better UX.
const assessmentSchema = OrchestratorInputSchema.omit({ 
  patientId: true, // Generated on the client
  symptoms: true, // Handled by a separate field
}).extend({
    mainSymptom: z.string().min(1, "يجب اختيار عرض رئيسي واحد على الأقل"),
}).refine(data => !data.addictionHistory || (data.addictionHistory && data.addictionDetails && data.addictionDetails.length > 0), {
    message: "يرجى تقديم تفاصيل عن استخدام المواد.",
    path: ["addictionDetails"],
}).refine(data => !data.familyHistory || (data.familyHistory && data.familyHistoryDetails && data.familyHistoryDetails.length > 0), {
    message: "يرجى تقديم تفاصيل عن التاريخ العائلي.",
    path: ["familyHistoryDetails"],
});


export default function NewPatientPage() {
  const [patientId, setPatientId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    setPatientId(generatePatientId());
  }, []);

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
        name: "",
        age: undefined,
        gender: "male",
        patientHistory: "Initial assessment, no detailed history provided yet.",
        addictionHistory: false,
        addictionDetails: "",
        familyHistory: false,
        familyHistoryDetails: "",
        currentMedications: [],
        mainSymptom: "",
    }
  });

  async function onSubmit(values: z.infer<typeof assessmentSchema>) {
    setIsProcessing(true);
    toast({
        title: "بدء التحليل",
        description: `جاري معالجة بيانات المريض: ${patientId}. قد تستغرق العملية دقيقة.`,
    });

    try {
      // Reconstruct the input to match the full OrchestratorInputSchema
      const orchestratorInput: z.infer<typeof OrchestratorInputSchema> = {
        patientId,
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        patientHistory: values.patientHistory,
        symptoms: [values.mainSymptom],
        currentMedications: values.currentMedications,
        addictionHistory: values.addictionHistory,
        addictionDetails: values.addictionDetails,
        familyHistory: values.familyHistory,
        familyHistoryDetails: values.familyHistoryDetails,
      };

      console.log("Submitting to orchestrator:", orchestratorInput);
      const result = await runOrchestratorAction(orchestratorInput);
      console.log("Orchestrator Result:", result);

      if (result) {
        toast({
          title: "اكتمل التحليل",
          description: "تمت معالجة بيانات المريض بنجاح.",
          variant: "default",
        });
        // Store result in local storage to pass to the results page
        localStorage.setItem(`patient_results_${patientId}`, JSON.stringify(result));
        router.push(`/patients/${patientId}`);
      } else {
         throw new Error("AI analysis returned no result.");
      }

    } catch (error) {
        console.error("AI processing failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            title: "خطأ في التحليل",
            description: `فشلت المعالجة: ${errorMessage}`,
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
    }
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
                        <FormLabel>اسم المريض</FormLabel>
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
                     <FormField
                        control={form.control}
                        name="addictionHistory"
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
                    {form.watch("addictionHistory") && (
                         <FormField
                            control={form.control}
                            name="addictionDetails"
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
                    
                    <FormField
                        control={form.control}
                        name="currentMedications"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>الأدوية النفسية الحالية أو السابقة</FormLabel>
                             <FormDescription>
                                اذكر الأدوية، الجرعات، والمدة إن وجدت. أدخل كل دواء في سطر منفصل.
                            </FormDescription>
                            <FormControl>
                             <Textarea
                                placeholder="مثال:&#10;Zoloft 50mg&#10;Wellbutrin 150mg"
                                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(m => m.trim() !== ''))}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <Separator />

                    <FormField
                        control={form.control}
                        name="familyHistory"
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
                    {form.watch("familyHistory") && (
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
                <Button type="submit" size="lg" disabled={isProcessing}>
                    {isProcessing ? (
                        <>
                            <Loader className="ml-2 h-5 w-5 animate-spin" />
                            جاري التحليل...
                        </>
                    ) : (
                        "بدء التحليل بواسطة AI"
                    )}
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
