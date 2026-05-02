import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { medicalApi, drugRecommendationApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  currentMedication: z.string().min(1, "Please enter a medication name"),
  reason: z.string().optional(),
  medicalConditions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const COND_MAX = 2000;

export default function DrugRecommendation() {
  const [recommendationResult, setRecommendationResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentMedication: "",
      reason: "",
      medicalConditions: "",
    },
  });

  const mc = form.watch("medicalConditions") ?? "";

  const { data: reasonsData, isLoading: reasonsLoading } = useQuery({
    queryKey: ["/api/medical/alternative-reasons"],
    queryFn: () => medicalApi.getAlternativeReasons(),
  });

  const recommendMutation = useMutation({
    mutationFn: drugRecommendationApi.findAlternatives,
    onSuccess: (data) => {
      setRecommendationResult(data.recommendation);
      toast({
        title: "Alternatives Found",
        description: "AI has found suitable drug alternatives for you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drug-recommendations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to find alternatives. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    recommendMutation.mutate(data);
  };

  const reasons = reasonsData?.reasons || [];

  const emptyMol = (
    <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[var(--radius-md)] bg-[var(--msc-accent-teal-light)] text-[var(--msc-accent-teal)]">
      <svg className="h-16 w-16 opacity-90" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2" />
        <circle cx="6" cy="7" r="1.5" />
        <circle cx="18" cy="7" r="1.5" />
        <circle cx="9" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
        <path strokeLinecap="round" d="M8 8l4 4M16 8l-4 4M10 13l4 7" />
      </svg>
    </div>
  );

  return (
    <div className="msc-page-bg">
      <div className="msc-animate-page msc-inner pb-16">
        <Navbar />
        <main className="msc-section-pad mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-center text-3xl font-bold text-[var(--text-heading)] md:text-[40px]">
              AI Drug Recommendation System
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-center font-sans text-base text-[var(--text-muted)]">
              Find alternative medicines using NLP and cosine similarity matching.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {["NLP", "Cosine Similarity", "10,000+ Drugs"].map((t) => (
                <span
                  key={t}
                  className="rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] px-3 py-1 font-sans text-[12px] font-semibold text-[var(--msc-accent-teal)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-accent-teal)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Search for Drug Alternatives</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="currentMedication"
                    render={({ field }) => (
                      <FormItem>
                        <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                          Current Medication
                        </label>
                        <FormControl>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--msc-accent-teal)]">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M4 14h16v6H4z" strokeLinejoin="round" />
                                <path d="M8 14V8l4-3 4 3v6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <Input
                              placeholder="Enter medication name e.g. Metformin..."
                              className={cn(
                                "h-12 rounded-[10px] border-[1.5px] border-[var(--msc-border)] pl-[46px]",
                                "focus-visible:border-[var(--msc-accent-teal)] focus-visible:ring-[3px] focus-visible:ring-[rgba(13,148,136,0.15)]",
                              )}
                              {...field}
                              data-testid="input-medication"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                          Reason for Alternative
                        </label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-reason"
                              className={cn(
                                "h-12 rounded-[10px] border-[1.5px] border-[var(--msc-border)] [&>svg]:text-[var(--text-muted)]",
                                "focus:ring-[3px] focus:ring-[rgba(13,148,136,0.15)] focus:ring-offset-0",
                              )}
                            >
                              <SelectValue placeholder="Select reason..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reasonsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              reasons.map((reason: string) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                          Medical Conditions
                        </label>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="List any allergies, conditions, or contraindications..."
                              rows={3}
                              className={cn(
                                "resize-y rounded-[10px] border-[1.5px] border-[var(--msc-border)] placeholder:text-[var(--text-placeholder)]",
                                "focus-visible:border-[var(--msc-accent-teal)] focus-visible:ring-[3px] focus-visible:ring-[rgba(13,148,136,0.15)]",
                              )}
                              maxLength={COND_MAX}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.slice(0, COND_MAX))}
                              data-testid="textarea-conditions"
                            />
                            <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] text-[var(--text-muted)]">
                              {(field.value ?? "").length}/{COND_MAX}
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
                      disabled={recommendMutation.isPending}
                      className="w-full rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal)] py-[14px] font-sans font-semibold text-white shadow-md transition-[transform,box-shadow] hover:scale-[1.01] hover:bg-[#0b7d71] hover:shadow-[0_4px_20px_rgba(13,148,136,0.3)]"
                      data-testid="button-find-alternatives"
                    >
                      {recommendMutation.isPending ? (
                        <>
                          <span
                            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"
                            aria-hidden
                          />
                          Finding Alternatives...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-pills mr-2" />
                          Find AI-Powered Alternatives
                        </>
                      )}
                    </Button>
                    <p className="mt-3 text-center font-sans text-[11px] tracking-wide text-[var(--text-muted)]">
                      🔒 HIPAA-safe · 🧬 NLP-Powered · ⚕ Pharmacist-reviewed data
                    </p>
                  </div>
                </form>
              </Form>
            </div>

            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-accent-teal)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Alternative Recommendations</h2>
              <div className="mt-8 space-y-4">
                {recommendationResult?.alternatives?.length > 0 ? (
                  recommendationResult.alternatives.map((alternative: any, index: number) => (
                    <div
                      key={index}
                      className="msc-card-lift rounded-[var(--radius-md)] border border-[var(--msc-border)] p-4 hover:border-[var(--msc-accent-teal)]"
                      data-testid={`card-alternative-${index}`}
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <h4 className="font-sans font-semibold text-[var(--text-heading)]" data-testid={`text-drug-name-${index}`}>
                          {alternative.name}
                        </h4>
                        <Badge className="rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] font-mono text-[10px] font-semibold text-[var(--msc-accent-teal)]">
                          <span data-testid={`badge-similarity-${index}`}>{alternative.similarity}% Match</span>
                        </Badge>
                      </div>
                      <div className="space-y-2 font-sans text-sm text-[var(--text-body)]">
                        <div>
                          <span className="font-medium text-[var(--text-heading)]">Active Ingredients:</span>{" "}
                          <span data-testid={`text-ingredients-${index}`}>{alternative.ingredients}</span>
                        </div>
                        <div>
                          <span className="font-medium text-[var(--text-heading)]">Dosage:</span>{" "}
                          <span data-testid={`text-dosage-${index}`}>{alternative.dosage}</span>
                        </div>
                        <div>
                          <span className="font-medium text-[var(--text-heading)]">Benefits:</span>{" "}
                          <span data-testid={`text-benefits-${index}`}>{alternative.benefits}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--msc-border)] bg-[var(--msc-accent-teal-light)] px-6 py-10 text-center text-[var(--msc-accent-teal)]">
                    {emptyMol}
                    <p className="font-sans text-sm text-[var(--text-muted)]">Enter a medication to explore AI-assisted alternatives.</p>
                  </div>
                )}

                <aside className="rounded-[var(--radius-sm)] border-l-[3px] border-[var(--msc-accent-teal)] bg-[var(--msc-accent-teal-light)] p-4">
                  <p className="font-sans text-[12px] font-bold text-[var(--msc-accent-teal)]">Pharmacist Consultation</p>
                  <p className="mt-1 font-sans text-[13px] leading-relaxed text-[var(--text-body)]">
                    Always confirm changes with your pharmacist or prescriber before switching medications.
                  </p>
                </aside>

                <p className="pt-4 text-center">
                  <Link href="/reports" className="font-sans text-[13px] font-semibold text-[var(--msc-accent-teal)] transition-colors hover:underline">
                    View history in Reports
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
