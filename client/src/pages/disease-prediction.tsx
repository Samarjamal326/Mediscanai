import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { medicalApi, diseasePredictionApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EXTRA_MAX = 2000;

export default function DiseasePrediction() {
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
      additionalInfo: "",
    },
  });

  const symptomsSel = form.watch("symptoms");
  const additionalInfo = form.watch("additionalInfo") ?? "";
  const extraLen = additionalInfo.length;

  const { data: symptomsData, isLoading: symptomsLoading } = useQuery({
    queryKey: ["/api/medical/symptoms"],
    queryFn: () => medicalApi.getSymptoms(),
  });

  const predictMutation = useMutation({
    mutationFn: diseasePredictionApi.predict,
    onSuccess: (data) => {
      setPredictionResult(data.prediction);
      toast({
        title: "Prediction Complete",
        description: "AI analysis has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/disease-predictions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    predictMutation.mutate(data);
  };

  const symptoms = symptomsData?.symptoms || [];

  const clipEmptyIllustration = useMemo(
    () => (
      <div className="mx-auto mb-6 flex h-28 w-[88px] items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--msc-primary)] bg-[var(--msc-primary-light)] text-[var(--msc-primary)]">
        <svg className="h-14 w-14 opacity-85" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
    ),
    [],
  );

  return (
    <div className="msc-page-bg">
      <div className="msc-animate-page msc-inner pb-16">
        <Navbar />
        <main className="msc-section-pad mx-auto">
          <div className="mb-8">
            <p className="mb-4 text-center font-sans text-[13px] text-[var(--text-muted)]">
              <Link href="/" className="transition-colors hover:text-[var(--msc-primary)]">
                Dashboard
              </Link>
              <span className="mx-1.5">&gt;</span>
              Disease Prediction
            </p>
            <h1 className="font-display text-center text-3xl font-bold text-[var(--text-heading)] md:text-[40px]">
              Disease Prediction System
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center font-sans text-base text-[var(--text-muted)]">
              Enter your symptoms and get AI-assisted insights with precaution and lifestyle reminders.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[55%_45%] md:gap-6">
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-primary)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Select Your Symptoms</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={() => (
                      <FormItem>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                            Primary Symptoms
                          </span>
                          <span className="rounded-[var(--radius-pill)] bg-[var(--msc-primary-light)] px-2.5 py-0.5 font-sans text-[11px] font-medium text-[var(--msc-primary)]">
                            {symptomsSel?.length ?? 0} selected
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {symptomsLoading ? (
                            <div className="col-span-2 py-6 text-center font-sans text-sm text-[var(--text-muted)]">
                              <i className="fas fa-spinner fa-spin mr-2" />
                              Loading symptoms...
                            </div>
                          ) : (
                            symptoms.map((symptom: string) => (
                              <FormField
                                key={symptom}
                                control={form.control}
                                name="symptoms"
                                render={({ field }) => {
                                  const checked = field.value?.includes(symptom);
                                  return (
                                    <FormItem className="m-0 space-y-0">
                                      <label
                                        className={cn(
                                          "flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border-[1.5px] px-4 py-2 font-sans text-[13px] text-[var(--text-body)] transition-colors",
                                          checked
                                            ? "border-[var(--msc-primary)] bg-[var(--msc-primary-light)] font-medium text-[var(--msc-primary)]"
                                            : "border-[var(--msc-border)] hover:border-[var(--msc-primary)] hover:bg-[var(--bg-surface-2)]",
                                        )}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={checked}
                                            className="sr-only"
                                            onCheckedChange={(c) =>
                                              c
                                                ? field.onChange([...(field.value || []), symptom])
                                                : field.onChange(field.value?.filter((v: string) => v !== symptom))
                                            }
                                            data-testid={`checkbox-symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`}
                                          />
                                        </FormControl>
                                        <span
                                          className={cn(
                                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                                            checked
                                              ? "border-[var(--msc-primary)] bg-[var(--msc-primary)]"
                                              : "border-[var(--msc-border)] bg-[var(--bg-surface)]",
                                          )}
                                        >
                                          {checked ? (
                                            <span className="block h-1 w-1 rounded-full bg-white" aria-hidden />
                                          ) : null}
                                        </span>
                                        <span>{symptom}</span>
                                      </label>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <span className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Additional Information
                        </span>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Describe any related concerns..."
                              className={cn(
                                "min-h-[120px] resize-y rounded-[10px] border-[1.5px] border-[var(--msc-border)] text-[var(--text-body)] placeholder:text-[var(--text-placeholder)]",
                                "focus-visible:border-[var(--msc-primary)] focus-visible:ring-[3px] focus-visible:ring-[rgba(37,99,235,0.1)]",
                              )}
                              maxLength={EXTRA_MAX}
                              {...field}
                              data-testid="textarea-additional-info"
                              onChange={(e) => field.onChange(e.target.value.slice(0, EXTRA_MAX))}
                            />
                            <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[11px] text-[var(--text-muted)]">
                              {extraLen}/{EXTRA_MAX}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Button
                      type="submit"
                      disabled={predictMutation.isPending}
                      className="w-full rounded-[var(--radius-pill)] bg-[var(--msc-primary)] py-[15px] font-sans text-[15px] font-semibold text-white shadow-md transition-[transform,box-shadow] hover:scale-[1.01] hover:bg-[var(--msc-primary-hover)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)]"
                      data-testid="button-analyze-symptoms"
                    >
                      {predictMutation.isPending ? (
                        <>
                          <span
                            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-2px]"
                            aria-hidden
                          />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-brain mr-2" />
                          Analyze Symptoms with AI
                        </>
                      )}
                    </Button>
                    <p className="mt-3 flex items-center justify-center gap-2 font-sans text-[11px] text-[var(--text-muted)]">
                      <i className="fas fa-lock opacity-75" aria-hidden /> Encrypted &amp; Private
                    </p>
                  </div>
                </form>
              </Form>
            </div>

            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-primary)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">AI Prediction Results</h2>
              <div className="mt-8">
                {predictionResult ? (
                  <div className="space-y-4">
                    <div className="rounded-[var(--radius-md)] border border-[var(--msc-border)] bg-[var(--bg-surface-2)] p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-sans font-semibold text-[var(--text-heading)]" data-testid="text-predicted-disease">
                          {predictionResult.disease}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="rounded-[var(--radius-pill)] bg-[var(--msc-primary-light)] font-mono text-[10px] font-semibold text-[var(--msc-primary)]"
                          data-testid="badge-confidence"
                        >
                          {predictionResult.confidence}% Confidence
                        </Badge>
                      </div>
                      <div className="space-y-3 font-sans text-sm">
                        <div>
                          <h5 className="mb-1 font-semibold text-[var(--text-heading)]">Recommended Treatment</h5>
                          <p className="text-[var(--text-body)]" data-testid="text-treatment">
                            {predictionResult.treatment}
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-[var(--text-heading)]">Precautions</h5>
                          <ul className="space-y-1 text-[var(--text-body)]">
                            {predictionResult.precautions?.map((precaution: string, index: number) => (
                              <li key={index} data-testid={`text-precaution-${index}`}>
                                • {precaution}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-[var(--text-heading)]">Diet Recommendations</h5>
                          <p className="text-[var(--text-body)]" data-testid="text-diet">
                            {predictionResult.diet}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--msc-border)] bg-[var(--bg-surface-2)] px-6 py-12 text-center">
                    {clipEmptyIllustration}
                    <p className="font-sans text-[var(--text-muted)]">
                      Select symptoms and click Analyze to see AI-assisted results.
                    </p>
                  </div>
                )}

                <aside className="mt-6 rounded-[var(--radius-sm)] border-l-[3px] border-[var(--msc-accent-teal)] bg-[var(--bg-surface-2)] p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-circle-info mt-0.5 text-[var(--msc-accent-teal)]" aria-hidden />
                    <div>
                      <p className="font-sans text-[12px] font-semibold text-[var(--msc-accent-teal)]">Medical Disclaimer</p>
                      <p className="mt-1 font-sans text-[13px] leading-relaxed text-[var(--text-body)]">
                        This output is informational only. Always consult a qualified clinician for diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
