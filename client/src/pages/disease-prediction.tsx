import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { medicalApi, diseasePredictionApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Disease Prediction System</h1>
            <p className="text-muted-foreground">Enter your symptoms and get AI-powered disease predictions with medical recommendations</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Symptom Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-stethoscope text-primary"></i>
                  <span>Select Your Symptoms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="symptoms"
                      render={() => (
                        <FormItem>
                          <FormLabel>Primary Symptoms</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {symptomsLoading ? (
                              <div className="col-span-2 text-center py-4">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Loading symptoms...
                              </div>
                            ) : (
                              symptoms.map((symptom: string) => (
                                <FormField
                                  key={symptom}
                                  control={form.control}
                                  name="symptoms"
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center space-x-2 p-2 border border-border rounded hover:bg-muted/50">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(symptom)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, symptom])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== symptom)
                                                  );
                                            }}
                                            data-testid={`checkbox-symptom-${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                          {symptom}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
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
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any additional symptoms or concerns..."
                              {...field}
                              data-testid="textarea-additional-info"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={predictMutation.isPending}
                      data-testid="button-analyze-symptoms"
                    >
                      {predictMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-brain mr-2"></i>
                          Analyze Symptoms with AI
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Prediction Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-primary"></i>
                  <span>AI Prediction Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionResult ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-card-foreground" data-testid="text-predicted-disease">
                          {predictionResult.disease}
                        </h4>
                        <Badge variant="secondary" data-testid="badge-confidence">
                          {predictionResult.confidence}% Confidence
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-card-foreground mb-1">Recommended Treatment</h5>
                          <p className="text-sm text-muted-foreground" data-testid="text-treatment">
                            {predictionResult.treatment}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-card-foreground mb-1">Precautions</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {predictionResult.precautions.map((precaution: string, index: number) => (
                              <li key={index} data-testid={`text-precaution-${index}`}>• {precaution}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-card-foreground mb-1">Diet Recommendations</h5>
                          <p className="text-sm text-muted-foreground" data-testid="text-diet">
                            {predictionResult.diet}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-brain text-4xl mb-4 opacity-50"></i>
                    <p>Select symptoms and click "Analyze" to get your AI-powered prediction</p>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <i className="fas fa-exclamation-triangle"></i>
                  <AlertDescription>
                    <strong>Medical Disclaimer:</strong> This AI prediction is for informational purposes only. 
                    Please consult a healthcare professional for proper diagnosis and treatment.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
    </div>
  );
}
