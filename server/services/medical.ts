// Medical data and utilities for the healthcare platform

export const commonSymptoms = [
  "Fever", "Headache", "Cough", "Fatigue", "Nausea", "Dizziness",
  "Shortness of breath", "Chest pain", "Muscle aches", "Sore throat",
  "Runny nose", "Stomach ache", "Diarrhea", "Vomiting", "Joint pain",
  "Skin rash", "Loss of appetite", "Weight loss", "Night sweats", "Chills"
];

export const genderOptions = ["Male", "Female", "Other"];

export const alternativeReasons = [
  "Side effects",
  "Cost concerns", 
  "Availability issues",
  "Doctor recommendation",
  "Allergic reaction",
  "Ineffective treatment"
];

export function calculateBMI(weight: number, height: number): number {
  return weight / ((height / 100) ** 2);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const medicalDisclaimer = "This AI-powered platform provides information for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.";
