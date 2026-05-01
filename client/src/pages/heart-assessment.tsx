import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low": return "default";
      case "moderate": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Heart Disease Risk Assessment</h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Risk Assessment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-heart text-destructive"></i>
                  <span>Health Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Years"
                                min="18"
                                max="120"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-age"
                              />
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
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-gender">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {gendersLoading ? (
                                  <SelectItem value="loading" disabled>Loading...</SelectItem>
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="170"
                                min="100"
                                max="250"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-height"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="70"
                                min="30"
                                max="300"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-weight"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormLabel className="text-base font-medium mb-3 block">Lifestyle Factors</FormLabel>
                      <div className="space-y-3">
                        {[
                          { name: "smoker", label: "Smoker" },
                          { name: "regularExercise", label: "Regular Exercise" },
                          { name: "highStress", label: "High Stress Levels" },
                        ].map((item) => (
                          <FormField
                            key={item.name}
                            control={form.control}
                            name={item.name as keyof FormData}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                    data-testid={`checkbox-${item.name}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel className="text-base font-medium mb-3 block">Medical History</FormLabel>
                      <div className="space-y-3">
                        {[
                          { name: "familyHistory", label: "Family History of Heart Disease" },
                          { name: "diabetes", label: "Diabetes" },
                          { name: "highBloodPressure", label: "High Blood Pressure" },
                          { name: "highCholesterol", label: "High Cholesterol" },
                        ].map((item) => (
                          <FormField
                            key={item.name}
                            control={form.control}
                            name={item.name as keyof FormData}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                    data-testid={`checkbox-${item.name}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-destructive hover:bg-destructive/90" 
                      disabled={assessMutation.isPending}
                      data-testid="button-assess-risk"
                    >
                      {assessMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Assessing Risk...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-heart-pulse mr-2"></i>
                          Assess Heart Risk with AI
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Risk Assessment Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-pie text-destructive"></i>
                  <span>Risk Assessment Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentResult ? (
                  <div className="space-y-6">
                    {/* Risk Percentage Circle */}
                    <div className="text-center p-6 border border-border rounded-lg">
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div className="w-24 h-24 rounded-full border-8 border-gray-200 relative">
                          <div 
                            className={`absolute inset-0 rounded-full border-8 border-destructive border-t-transparent transform`}
                            style={{ 
                              transform: `rotate(${(assessmentResult.percentage / 100) * 360}deg)`,
                              transition: "transform 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-destructive" data-testid="text-risk-percentage">
                            {assessmentResult.percentage}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className={`text-lg font-semibold ${getRiskColor(assessmentResult.level)}`} data-testid="text-risk-level">
                          {assessmentResult.level} Risk
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid="text-risk-description">
                          {assessmentResult.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* AI Recommendations */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-card-foreground">AI Recommendations</h4>
                      
                      {assessmentResult.positiveFactors?.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h5 className="font-medium text-green-800 mb-1">Positive Factors</h5>
                          <ul className="text-sm text-green-700 space-y-1">
                            {assessmentResult.positiveFactors.map((factor: string, index: number) => (
                              <li key={index} data-testid={`text-positive-factor-${index}`}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {assessmentResult.riskFactors?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <h5 className="font-medium text-red-800 mb-1">Risk Factors</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {assessmentResult.riskFactors.map((factor: string, index: number) => (
                              <li key={index} data-testid={`text-risk-factor-${index}`}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {assessmentResult.recommendations?.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="font-medium text-blue-800 mb-1">Recommendations</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {assessmentResult.recommendations.map((recommendation: string, index: number) => (
                              <li key={index} data-testid={`text-recommendation-${index}`}>• {recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-heart text-4xl mb-4 opacity-50"></i>
                    <p>Complete the health information form to get your AI-powered heart risk assessment</p>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <i className="fas fa-exclamation-triangle"></i>
                  <AlertDescription>
                    <strong>Medical Disclaimer:</strong> This assessment is for educational purposes only. 
                    Consult with healthcare professionals for comprehensive cardiovascular evaluation.
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
