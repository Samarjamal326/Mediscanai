import { apiRequest } from "./queryClient";

export interface DiseasePredictionRequest {
  symptoms: string[];
  additionalInfo?: string;
}

export interface DrugRecommendationRequest {
  currentMedication: string;
  reason?: string;
  medicalConditions?: string;
}

export interface HeartAssessmentRequest {
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
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  isUser: boolean;
}

// Medical data API
export const medicalApi = {
  getSymptoms: () => fetch("/api/medical/symptoms").then(res => res.json()),
  getGenders: () => fetch("/api/medical/genders").then(res => res.json()),
  getAlternativeReasons: () => fetch("/api/medical/alternative-reasons").then(res => res.json()),
};

// Disease prediction API
export const diseasePredictionApi = {
  predict: (data: DiseasePredictionRequest) => 
    apiRequest("POST", "/api/disease-prediction", data).then(res => res.json()),
  getHistory: () => fetch("/api/disease-predictions").then(res => res.json()),
};

// Drug recommendation API
export const drugRecommendationApi = {
  findAlternatives: (data: DrugRecommendationRequest) => 
    apiRequest("POST", "/api/drug-recommendation", data).then(res => res.json()),
  getHistory: () => fetch("/api/drug-recommendations").then(res => res.json()),
};

// Heart assessment API
export const heartAssessmentApi = {
  assess: (data: HeartAssessmentRequest) => 
    apiRequest("POST", "/api/heart-assessment", data).then(res => res.json()),
  getHistory: () => fetch("/api/heart-assessments").then(res => res.json()),
};

// Chat API
export const chatApi = {
  sendMessage: (data: ChatRequest) => 
    apiRequest("POST", "/api/chat", data).then(res => res.json()),
  getMessages: (sessionId: string) => 
    fetch(`/api/chat/${sessionId}`).then(res => res.json()),
};
