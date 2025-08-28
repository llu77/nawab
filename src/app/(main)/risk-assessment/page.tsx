"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getRelapsePrediction } from "./actions";
import { PageHeader } from "@/components/page-header";
import type { RelapsePredictionOutput } from "@/ai/flows/relapse-prediction";

const riskFormSchema = z.object({
  behavioralPatterns: z.string().min(100, "Please provide detailed behavioral patterns (at least 100 characters)."),
  patientHistory: z.string().min(50, "Please provide patient history (at least 50 characters)."),
  riskFactors: z.string().min(20, "Please list relevant risk factors."),
});

export default function RiskAssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RelapsePredictionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      behavioralPatterns: "",
      patientHistory: "",
      riskFactors: "",
    },
  });

  async function onSubmit(values: z.infer<typeof riskFormSchema>) {
    setIsLoading(true);
    setResult(null);

    const response = await getRelapsePrediction(values);

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

  const getRiskColor = (probability: number) => {
    if (probability > 70) return "bg-destructive";
    if (probability > 40) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getRiskLevel = (probability: number) => {
    if (probability > 70) return "High";
    if (probability > 40) return "Moderate";
    return "Low";
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Predictive Risk Tool"
        description="Based on behavioral patterns, predict patient relapse probability to adjust care and therapy plans."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="behavioralPatterns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavioral Patterns</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Increased social withdrawal, changes in sleep patterns, missed appointments..."
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
                    name="patientHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relevant Patient History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Previous relapse events, adherence to past treatments..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riskFactors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Known Risk Factors</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Lack of social support, recent stressful life event, substance use..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Predict Relapse Risk
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Relapse Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">AI is calculating relapse probability...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-4 bg-accent/50 rounded-full">
                    <ShieldAlert className="h-10 w-10 text-primary" />
                  </div>
                  <p className="mt-4 text-muted-foreground">The patient's relapse risk prediction will appear here.</p>
                </div>
              )}
              {result && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Relapse Probability</p>
                    <p className="text-6xl font-bold font-headline mt-2">
                      {result.relapseProbability.toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${getRiskColor(result.relapseProbability)}`}>
                        {getRiskLevel(result.relapseProbability)} Risk
                      </span>
                    </div>
                  </div>
                  <div className="w-full">
                    <Progress value={result.relapseProbability} className="h-3 [&>div]:bg-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rationale</h4>
                    <p className="text-sm text-muted-foreground bg-accent/50 p-4 rounded-md">{result.rationale}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
