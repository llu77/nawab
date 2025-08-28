"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles } from "lucide-react";

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
import type { SummaryOutput } from "@/ai/flows/ai-summary-generator";

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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI Summary Generator"
        description="Condense session notes and patient data into quick, readable summaries for faster context retrieval."
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Source Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="patientData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Demographics, diagnosis, medication list, allergies..."
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
                        <FormLabel>Session Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste one or more recent session notes here..."
                            className="min-h-[250px]"
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
                    Generate Summary
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Generated Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">AI is summarizing the text...</p>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-4 bg-accent/50 rounded-full">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <p className="mt-4 text-muted-foreground">The generated summary will appear here.</p>
                </div>
              )}
              {result && (
                <div className="prose prose-sm max-w-none text-foreground prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                  <p>{result.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
