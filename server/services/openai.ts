import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 2.0 Flash — free tier: 15 req/min, 1M tokens/day
// Using gemini-flash-latest as it is available in the model list
const GEMINI_MODEL = "gemini-flash-latest";

// Lazy client getter — reads the API key at call time (after dotenv has loaded)
// This avoids ES module hoisting issues where top-level init runs before dotenv
function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "dummy-key-for-fallback-mode") {
    throw new Error("GEMINI_API_KEY not set — using fallback mode");
  }
  return new GoogleGenerativeAI(apiKey);
}

// Fallback functions for when Gemini API is unavailable
function generateFallbackDiseasePrediction(symptoms: string[], additionalInfo?: string) {
  const symptomsText = symptoms.join(", ").toLowerCase();
  
  // Simple rule-based prediction for demonstration
  let disease = "Common Viral Infection";
  let confidence = 75;
  let treatment = "Rest, hydration, and over-the-counter pain relievers";
  let precautions = ["Monitor symptoms", "Seek medical attention if symptoms worsen", "Stay hydrated"];
  let diet = "Light, nutritious foods and plenty of fluids";

  // Basic symptom pattern matching
  if (symptomsText.includes("fever") && symptomsText.includes("cough")) {
    disease = "Upper Respiratory Infection";
    confidence = 80;
    treatment = "Rest, fluids, throat lozenges, and fever reducers";
    precautions = ["Isolate to prevent spread", "Monitor temperature", "Seek medical care if breathing difficulties occur"];
    diet = "Warm liquids, soft foods, and vitamin C rich foods";
  } else if (symptomsText.includes("headache") && symptomsText.includes("fatigue")) {
    disease = "Tension Headache or Stress";
    confidence = 70;
    treatment = "Rest, stress management, and pain relievers";
    precautions = ["Identify stress triggers", "Maintain regular sleep schedule", "Stay hydrated"];
    diet = "Regular meals, limit caffeine, and stay hydrated";
  } else if (symptomsText.includes("stomach") || symptomsText.includes("nausea")) {
    disease = "Gastroenteritis";
    confidence = 72;
    treatment = "Rest, clear fluids, and gradual reintroduction of bland foods";
    precautions = ["Avoid dairy and fatty foods", "Stay hydrated", "Seek medical care if severe dehydration"];
    diet = "BRAT diet (Bananas, Rice, Applesauce, Toast)";
  }

  return {
    disease: `${disease} (Demo Prediction)`,
    confidence,
    treatment: `${treatment}. *This is a demo response - consult healthcare professionals for actual diagnosis.*`,
    precautions: [...precautions, "This is a demo prediction - always consult qualified healthcare providers"],
    diet: `${diet}. *General dietary guidance - consult a nutritionist for personalized advice.*`
  };
}

function generateFallbackDrugAlternatives(medication: string, reason?: string, conditions?: string) {
  const alternatives = [
    {
      name: `Generic ${medication} Alternative (Demo)`,
      similarity: 85,
      ingredients: "Similar active compounds",
      dosage: "As prescribed by healthcare provider",
      benefits: "Cost-effective alternative with similar therapeutic effects"
    },
    {
      name: `Extended-Release ${medication} (Demo)`,
      similarity: 90,
      ingredients: "Same active ingredient, modified release",
      dosage: "Once daily as prescribed",
      benefits: "Longer duration of action, improved compliance"
    }
  ];

  if (reason === "Side effects") {
    alternatives.push({
      name: `Low-Side-Effect ${medication} Alternative (Demo)`,
      similarity: 80,
      ingredients: "Different formulation with reduced side effects",
      dosage: "As prescribed",
      benefits: "Reduced gastrointestinal side effects"
    });
  }

  return { alternatives };
}

function generateFallbackHeartRisk(data: any) {
  const bmi = data.weight / ((data.height / 100) ** 2);
  let riskPercentage = 15; // Base risk
  const riskFactors = [];
  const positiveFactors = [];
  const recommendations = [];

  // Calculate risk based on factors
  if (data.age > 45) riskPercentage += 10;
  if (data.smoker) {
    riskPercentage += 15;
    riskFactors.push("Smoking significantly increases cardiovascular risk");
  }
  if (!data.regularExercise) {
    riskPercentage += 8;
    riskFactors.push("Sedentary lifestyle");
  } else {
    positiveFactors.push("Regular exercise routine");
  }
  if (data.familyHistory) {
    riskPercentage += 12;
    riskFactors.push("Family history of heart disease");
  }
  if (data.diabetes) {
    riskPercentage += 10;
    riskFactors.push("Diabetes increases cardiovascular risk");
  }
  if (data.highBloodPressure) {
    riskPercentage += 12;
    riskFactors.push("Hypertension");
  }
  if (data.highCholesterol) {
    riskPercentage += 8;
    riskFactors.push("High cholesterol levels");
  }
  if (bmi > 30) {
    riskPercentage += 6;
    riskFactors.push("Obesity (BMI > 30)");
  }

  riskPercentage = Math.min(95, Math.max(5, riskPercentage));

  let level = "Low";
  if (riskPercentage > 30) level = "Moderate";
  if (riskPercentage > 60) level = "High";

  // Generate recommendations
  if (data.smoker) recommendations.push("Quit smoking immediately");
  if (!data.regularExercise) recommendations.push("Start regular cardiovascular exercise");
  if (bmi > 25) recommendations.push("Maintain healthy weight through diet and exercise");
  recommendations.push("Regular cardiovascular checkups");
  recommendations.push("Monitor blood pressure and cholesterol");

  return {
    percentage: riskPercentage,
    level: `${level} (Demo Assessment)`,
    description: `Based on your profile, you have a ${level.toLowerCase()} risk of cardiovascular disease. *This is a demo assessment - consult healthcare professionals for accurate evaluation.*`,
    positiveFactors,
    riskFactors: [...riskFactors, "*Demo assessment - consult cardiologist for comprehensive evaluation*"],
    recommendations: [...recommendations, "*These are general recommendations - consult healthcare providers for personalized advice*"]
  };
}

export async function generateMedicalResponse(message: string): Promise<string> {
  try {
    const model = getClient().getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: `You are MediBot, an AI-powered medical assistant with access to comprehensive medical literature. 
          You provide accurate, evidence-based health information while emphasizing the importance of professional medical consultation.
          
          Guidelines:
          - Provide informative, helpful responses based on medical knowledge
          - Always include medical disclaimers when appropriate
          - Suggest consulting healthcare professionals for diagnosis or treatment
          - Use clear, accessible language
          - Cite confidence levels when possible
          - Never provide specific diagnoses or treatment recommendations
          
          Format your responses to be helpful and educational while maintaining medical ethics.`
    });

    const result = await model.generateContent(message);
    const response = result.response;
    const text = response.text();

    return text || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback response when Gemini is unavailable
    return `Hello! I'm MediBot, your AI health assistant. I'm currently experiencing high demand but I'm here to help with your medical questions.

For your question: "${message}"

I can provide general health information and guidance. However, I want to emphasize that this information is for educational purposes only and should not replace professional medical advice.

Please consult with qualified healthcare professionals for:
- Specific medical diagnoses
- Treatment recommendations
- Emergency medical situations
- Prescription medication guidance

How can I help you further with general health information?

*Note: This is a demo response due to API limitations. In production, I would provide more detailed, personalized medical guidance.*`;
  }
}

export async function analyzeSymptomsForDisease(symptoms: string[], additionalInfo?: string): Promise<{
  disease: string;
  confidence: number;
  treatment: string;
  precautions: string[];
  diet: string;
}> {
  try {
    const symptomsText = symptoms.join(", ");
    const prompt = `Analyze these symptoms for potential disease prediction: ${symptomsText}${additionalInfo ? `. Additional info: ${additionalInfo}` : ''}
    
    Provide a medical assessment in JSON format with these exact keys:
    - "disease": most likely condition name (string)
    - "confidence": percentage 0-100 (number)
    - "treatment": general treatment recommendations (string)
    - "precautions": array of precautionary measures (array of strings)
    - "diet": dietary recommendations (string)
    
    Remember this is for educational purposes only and should not replace professional medical diagnosis.
    Return ONLY valid JSON, no markdown or extra text.`;

    const model = getClient().getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: "You are a medical AI assistant that provides disease predictions based on symptoms. Always emphasize that this is for educational purposes and professional consultation is required. You must respond with valid JSON only.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    
    return {
      disease: parsed.disease || "Unable to determine",
      confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
      treatment: parsed.treatment || "Consult a healthcare professional",
      precautions: Array.isArray(parsed.precautions) ? parsed.precautions : ["Consult a healthcare professional"],
      diet: parsed.diet || "Maintain a balanced diet"
    };
  } catch (error) {
    console.error("Disease prediction error:", error);
    // Fallback prediction when Gemini is unavailable
    const symptomAnalysis = generateFallbackDiseasePrediction(symptoms, additionalInfo);
    return symptomAnalysis;
  }
}

export async function findDrugAlternatives(medication: string, reason?: string, conditions?: string): Promise<{
  alternatives: Array<{
    name: string;
    similarity: number;
    ingredients: string;
    dosage: string;
    benefits: string;
  }>;
}> {
  try {
    const prompt = `Find alternative medications for: ${medication}${reason ? `. Reason for alternative: ${reason}` : ''}${conditions ? `. Medical conditions: ${conditions}` : ''}
    
    Provide drug alternatives in JSON format with these exact keys:
    - "alternatives": array of objects, each with:
      - "name": drug name (string)
      - "similarity": similarity percentage 0-100 (number)
      - "ingredients": active ingredients (string)
      - "dosage": recommended dosage (string)
      - "benefits": key benefits (string)
    
    Focus on medications with similar therapeutic effects but different formulations or active ingredients.
    Return ONLY valid JSON, no markdown or extra text.`;

    const model = getClient().getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: "You are a pharmaceutical AI assistant that suggests alternative medications based on active ingredients and therapeutic effects. Always recommend consulting with healthcare professionals. You must respond with valid JSON only.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    
    return {
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.map((alt: any) => ({
        name: alt.name || "Unknown",
        similarity: Math.min(100, Math.max(0, alt.similarity || 0)),
        ingredients: alt.ingredients || "Consult pharmacist",
        dosage: alt.dosage || "As prescribed",
        benefits: alt.benefits || "Consult healthcare provider"
      })) : []
    };
  } catch (error) {
    console.error("Drug alternatives error:", error);
    // Fallback alternatives when Gemini is unavailable
    const alternatives = generateFallbackDrugAlternatives(medication, reason, conditions);
    return alternatives;
  }
}

export async function assessHeartRisk(data: {
  age: number;
  gender: string;
  height: number;
  weight: number;
  smoker: boolean;
  regularExercise: boolean;
  highStress: boolean;
  familyHistory: boolean;
  diabetes: boolean;
  highBloodPressure: boolean;
  highCholesterol: boolean;
}): Promise<{
  percentage: number;
  level: string;
  description: string;
  positiveFactors: string[];
  riskFactors: string[];
  recommendations: string[];
}> {
  try {
    const bmi = data.weight / ((data.height / 100) ** 2);
    
    const prompt = `Assess heart disease risk for patient with:
    Age: ${data.age}, Gender: ${data.gender}, BMI: ${bmi.toFixed(1)}
    Lifestyle: Smoker: ${data.smoker}, Exercise: ${data.regularExercise}, High Stress: ${data.highStress}
    Medical History: Family History: ${data.familyHistory}, Diabetes: ${data.diabetes}, High BP: ${data.highBloodPressure}, High Cholesterol: ${data.highCholesterol}
    
    Provide heart disease risk assessment in JSON format with these exact keys:
    - "percentage": risk percentage 0-100 (number)
    - "level": risk level - "Low", "Moderate", or "High" (string)
    - "description": brief risk description (string)
    - "positiveFactors": array of positive health factors (array of strings)
    - "riskFactors": array of risk factors present (array of strings)
    - "recommendations": array of health recommendations (array of strings)
    
    Return ONLY valid JSON, no markdown or extra text.`;

    const model = getClient().getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: "You are a cardiovascular health AI specialist that assesses heart disease risk based on lifestyle and medical factors. Provide evidence-based risk assessments. You must respond with valid JSON only.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    
    return {
      percentage: Math.min(100, Math.max(0, parsed.percentage || 0)),
      level: parsed.level || "Moderate",
      description: parsed.description || "Consult with a healthcare provider for detailed assessment",
      positiveFactors: Array.isArray(parsed.positiveFactors) ? parsed.positiveFactors : [],
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Consult healthcare provider"]
    };
  } catch (error) {
    console.error("Heart risk assessment error:", error);
    // Fallback assessment when Gemini is unavailable
    const riskAssessment = generateFallbackHeartRisk(data);
    return riskAssessment;
  }
}
