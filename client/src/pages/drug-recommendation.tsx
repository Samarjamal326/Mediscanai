import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { medicalApi, drugRecommendationApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  currentMedication: z.string().min(1, "Please enter a medication name"),
  reason: z.string().optional(),
  medicalConditions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">AI Drug Recommendation System</h1>
            <p className="text-muted-foreground">Find alternative medicines using NLP and cosine similarity matching</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Drug Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-pills text-accent"></i>
                  <span>Search for Drug Alternatives</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="currentMedication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medication</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter medication name..."
                                {...field}
                                className="pr-10"
                                data-testid="input-medication"
                              />
                              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
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
                          <FormLabel>Reason for Alternative</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-reason">
                                <SelectValue placeholder="Select reason..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reasonsLoading ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
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
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any allergies or medical conditions..."
                              {...field}
                              rows={2}
                              data-testid="textarea-conditions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent/90" 
                      disabled={recommendMutation.isPending}
                      data-testid="button-find-alternatives"
                    >
                      {recommendMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Finding Alternatives...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-pills mr-2"></i>
                          Find AI-Powered Alternatives
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Alternative Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-list text-accent"></i>
                  <span>Alternative Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationResult?.alternatives?.length > 0 ? (
                  <div className="space-y-4">
                    {recommendationResult.alternatives.map((alternative: any, index: number) => (
                      <div 
                        key={index} 
                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                        data-testid={`card-alternative-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-card-foreground" data-testid={`text-drug-name-${index}`}>
                            {alternative.name}
                          </h4>
                          <Badge 
                            variant={alternative.similarity >= 90 ? "default" : "secondary"}
                            data-testid={`badge-similarity-${index}`}
                          >
                            {alternative.similarity}% Match
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-card-foreground">Active Ingredients:</span>
                            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-ingredients-${index}`}>
                              {alternative.ingredients}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-card-foreground">Dosage:</span>
                            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-dosage-${index}`}>
                              {alternative.dosage}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-card-foreground">Benefits:</span>
                            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-benefits-${index}`}>
                              {alternative.benefits}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-pills text-4xl mb-4 opacity-50"></i>
                    <p>Enter a medication name to find AI-powered alternatives</p>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <i className="fas fa-info-circle"></i>
                  <AlertDescription>
                    <strong>Pharmacist Consultation:</strong> Always consult with your pharmacist or doctor before switching medications.
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
