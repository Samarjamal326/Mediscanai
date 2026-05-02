import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { medicalApi, heartAssessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  age: z.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  gender: z.string().min(1, "Please select a gender"),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  smoker: z.boolean().default(false),
  regularExercise: z.boolean().default(false),
  highStress: z.boolean().default(false),
  familyHistory: z.boolean().default(false),
  diabetes: z.boolean().default(false),
  highBloodPressure: z.boolean().default(false),
  highCholesterol: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

function PillCheck({
  checked,
  onChange,
  label,
  testId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  testId: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border-[1.5px] px-4 py-2.5 font-sans text-[13px] transition-colors",
        checked
          ? "border-[var(--msc-danger)] bg-[var(--msc-danger-light)] font-medium text-[var(--msc-danger)]"
          : "border-[var(--msc-border)] bg-[var(--bg-surface)] text-[var(--text-body)] hover:border-[var(--msc-danger)] hover:bg-[var(--msc-danger-light)]/50",
      )}
    >
      <Checkbox checked={checked} className="sr-only" onCheckedChange={(c) => onChange(!!c)} data-testid={testId} />
      <span
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-[var(--msc-danger)] bg-[var(--msc-danger)]" : "border-[var(--msc-border)]",
        )}
      >
        {checked ? <span className="block h-1 w-1 rounded-full bg-white" aria-hidden /> : null}
      </span>
      {label}
    </label>
  );
}

export default function HeartAssessment() {
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      gender: "",
      height: 170,
      weight: 70,
      smoker: false,
      regularExercise: false,
      highStress: false,
      familyHistory: false,
      diabetes: false,
      highBloodPressure: false,
      highCholesterol: false,
    },
  });

  const { data: gendersData, isLoading: gendersLoading } = useQuery({
    queryKey: ["/api/medical/genders"],
    queryFn: () => medicalApi.getGenders(),
  });

  const assessMutation = useMutation({
    mutationFn: heartAssessmentApi.assess,
    onSuccess: (data) => {
      setAssessmentResult(data.assessment);
      toast({
        title: "Assessment Complete",
        description: "Your heart disease risk assessment has been completed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/heart-assessments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to assess heart risk. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    assessMutation.mutate(data);
  };

  const genders = gendersData?.genders || [];

  const getRiskColorClass = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-700";
      case "moderate":
        return "text-amber-700";
      case "high":
        return "text-[var(--msc-danger)]";
      default:
        return "text-[var(--text-muted)]";
    }
  };

  const numInputClass =
    "h-11 w-full rounded-[10px] border-[1.5px] border-[var(--msc-border)] pr-12 focus-visible:border-[var(--msc-danger)] focus-visible:ring-[3px] focus-visible:ring-[rgba(220,38,38,0.15)]";

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
              Heart Risk
            </p>
            <h1 className="font-display text-center text-3xl font-bold md:text-[40px]">
              <span className="text-[var(--text-heading)]">Heart Disease </span>
              <span className="text-[var(--msc-danger)]">Risk</span>
              <span className="text-[var(--text-heading)]"> Assessment</span>
            </h1>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--msc-danger-light)] px-4 py-1 font-sans text-[13px] font-semibold text-[var(--msc-danger)]">
                <span aria-hidden>❤️</span> Cardiovascular AI
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-danger)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Health Information</h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                            Age
                          </label>
                          <div className="relative">
                            <FormControl>
                              <input
                                type="number"
                                placeholder="Years"
                                min={18}
                                max={120}
                                className={numInputClass}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-age"
                              />
                            </FormControl>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[11px] text-[var(--text-muted)]">
                              yrs
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="min-w-0">
                          <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                            Gender
                          </label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger
                                data-testid="select-gender"
                                className={cn(
                                  "h-11 rounded-[10px] border-[1.5px] border-[var(--msc-border)]",
                                  "focus:ring-[3px] focus:ring-[rgba(220,38,38,0.15)] focus:ring-offset-0",
                                )}
                              >
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gendersLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                genders.map((gender: string) => (
                                  <SelectItem key={gender} value={gender}>
                                    {gender}
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
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                            Height
                          </label>
                          <div className="relative">
                            <FormControl>
                              <input
                                type="number"
                                placeholder="170"
                                min={100}
                                max={250}
                                className={numInputClass}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-height"
                              />
                            </FormControl>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[11px] text-[var(--text-muted)]">
                              cm
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <label className="mb-2 block font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                            Weight
                          </label>
                          <div className="relative">
                            <FormControl>
                              <input
                                type="number"
                                placeholder="70"
                                min={30}
                                max={300}
                                className={numInputClass}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-weight"
                              />
                            </FormControl>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">
                              kg
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Lifestyle Factors
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <FormField
                        control={form.control}
                        name="smoker"
                        render={({ field }) => (
                          <FormItem className="m-0 space-y-0">
                            <FormControl>
                              <PillCheck
                                checked={!!field.value}
                                onChange={field.onChange}
                                label="Smoker"
                                testId="checkbox-smoker"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="regularExercise"
                        render={({ field }) => (
                          <FormItem className="m-0 space-y-0">
                            <FormControl>
                              <PillCheck
                                checked={!!field.value}
                                onChange={field.onChange}
                                label="Regular Exercise"
                                testId="checkbox-regularExercise"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="highStress"
                        render={({ field }) => (
                          <FormItem className="m-0 space-y-0">
                            <FormControl>
                              <PillCheck
                                checked={!!field.value}
                                onChange={field.onChange}
                                label="High Stress"
                                testId="checkbox-highStress"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Medical History
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {(
                        [
                          ["familyHistory", "Family History of Heart Disease"],
                          ["diabetes", "Diabetes"],
                          ["highBloodPressure", "High Blood Pressure"],
                          ["highCholesterol", "High Cholesterol"],
                        ] as const
                      ).map(([name, lab]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem className="m-0 space-y-0">
                              <FormControl>
                                <PillCheck
                                  checked={!!field.value}
                                  onChange={field.onChange}
                                  label={lab}
                                  testId={`checkbox-${name}`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      disabled={assessMutation.isPending}
                      className="w-full rounded-[var(--radius-pill)] bg-[var(--msc-danger)] py-[14px] font-sans font-semibold text-white shadow-md transition-[transform,box-shadow] hover:scale-[1.01] hover:bg-[#b91c1c] hover:shadow-[0_4px_20px_rgba(220,38,38,0.35)]"
                      data-testid="button-assess-risk"
                    >
                      {assessMutation.isPending ? (
                        <>
                          <span
                            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"
                            aria-hidden
                          />
                          Assessing Risk...
                        </>
                      ) : (
                        <>
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center" aria-hidden>
                            <span className="heart-beat-inline text-lg leading-none">
                              <i className="fas fa-heart-pulse" />
                            </span>
                          </span>
                          Assess Heart Risk with AI
                        </>
                      )}
                    </Button>
                    <p className="mt-3 text-center font-sans text-[11px] text-[var(--text-muted)]">
                      🔒 Secure · ⚕ AI-Assisted · 📋 For Educational Use
                    </p>
                  </div>
                  <style>{`
                  @keyframes heart-beat-mini {
                    0%,100% { transform: scaleY(1); }
                    40% { transform: scaleY(0.88); }
                    60% { transform: scaleY(1.06); }
                  }
                  .heart-beat-inline { animation: heart-beat-mini 1.1s ease-in-out infinite; }
                `}</style>
                </form>
              </Form>
            </div>

            <div
              className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]"
              style={{ borderTop: "3px solid var(--msc-danger)", borderBottomWidth: 1 }}
            >
              <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Risk Assessment Results</h2>

              <div className="mt-8">
                {assessmentResult ? (
                  <div className="space-y-6 font-sans text-sm">
                    <div className="rounded-[var(--radius-md)] border border-[var(--msc-border)] bg-[var(--bg-surface-2)] p-6 text-center">
                      <div className="relative mx-auto mb-4 h-24 w-24">
                        <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100" aria-hidden>
                          <circle cx="50" cy="50" r="42" stroke="var(--msc-border)" strokeWidth="12" fill="none" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="var(--msc-danger)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${(assessmentResult.percentage / 100) * 264} 264`}
                            className="transition-[stroke-dasharray] duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-[var(--msc-danger)]" data-testid="text-risk-percentage">
                          {assessmentResult.percentage}%
                        </span>
                      </div>
                      <h4 className={`text-lg font-bold ${getRiskColorClass(assessmentResult.level)}`} data-testid="text-risk-level">
                        {assessmentResult.level} Risk
                      </h4>
                      <p className="mt-2 text-[var(--text-muted)]" data-testid="text-risk-description">
                        {assessmentResult.description}
                      </p>
                    </div>

                    {assessmentResult.positiveFactors?.length > 0 ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <h5 className="font-semibold text-green-800">Positive Factors</h5>
                        <ul className="mt-1 space-y-1 text-green-800">
                          {assessmentResult.positiveFactors.map((factor: string, index: number) => (
                            <li key={index} data-testid={`text-positive-factor-${index}`}>
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {assessmentResult.riskFactors?.length > 0 ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <h5 className="font-semibold text-red-800">Risk Factors</h5>
                        <ul className="mt-1 space-y-1 text-red-900">
                          {assessmentResult.riskFactors.map((factor: string, index: number) => (
                            <li key={index} data-testid={`text-risk-factor-${index}`}>
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {assessmentResult.recommendations?.length > 0 ? (
                      <div className="rounded-lg border border-[var(--msc-primary-light)] bg-[var(--msc-primary-light)] p-3">
                        <h5 className="font-semibold text-[var(--msc-primary)]">Recommendations</h5>
                        <ul className="mt-1 space-y-1 text-[var(--text-body)]">
                          {assessmentResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} data-testid={`text-recommendation-${index}`}>
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--msc-danger)] bg-[var(--msc-danger-light)] px-6 py-12 text-center">
                    <span className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--msc-danger)]/15 text-[var(--msc-danger)]">
                      <i className="fas fa-heart-pulse text-5xl opacity-90" aria-hidden />
                    </span>
                    <p className="font-sans text-[var(--text-muted)]">Complete the form to view your cardiovascular outlook.</p>
                  </div>
                )}

                <aside className="mt-6 rounded-[var(--radius-sm)] border-l-[3px] border-[var(--msc-danger)] bg-[var(--msc-danger-light)] p-4">
                  <p className="font-sans text-[12px] font-bold text-[var(--msc-danger)]">Medical Disclaimer</p>
                  <p className="mt-1 font-sans text-[13px] text-[var(--text-body)]">
                    Educational use only. Consult professionals for definitive cardiovascular evaluation.
                  </p>
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
