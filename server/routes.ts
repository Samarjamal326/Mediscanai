import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDiseasePredictionSchema,
  insertDrugRecommendationSchema,
  insertHeartAssessmentSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { 
  generateMedicalResponse,
  analyzeSymptomsForDisease,
  findDrugAlternatives,
  assessHeartRisk
} from "./services/openai";
import { commonSymptoms, genderOptions, alternativeReasons } from "./services/medical";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get common medical data
  app.get("/api/medical/symptoms", async (req, res) => {
    try {
      res.json({ symptoms: commonSymptoms });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch symptoms" });
    }
  });

  app.get("/api/medical/genders", async (req, res) => {
    try {
      res.json({ genders: genderOptions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gender options" });
    }
  });

  app.get("/api/medical/alternative-reasons", async (req, res) => {
    try {
      res.json({ reasons: alternativeReasons });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alternative reasons" });
    }
  });

  // Disease Prediction Routes
  app.post("/api/disease-prediction", async (req, res) => {
    try {
      const validatedData = insertDiseasePredictionSchema.parse(req.body);
      
      // Create prediction record
      const prediction = await storage.createDiseasePrediction(validatedData);
      
      // Get AI analysis
      const analysis = await analyzeSymptomsForDisease(
        validatedData.symptoms,
        validatedData.additionalInfo || undefined
      );
      
      // Update prediction with analysis
      prediction.prediction = analysis;
      
      res.json({ 
        success: true, 
        prediction: {
          id: prediction.id,
          ...analysis
        }
      });
    } catch (error) {
      console.error("Disease prediction error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to predict disease" 
      });
    }
  });

  app.get("/api/disease-predictions", async (req, res) => {
    try {
      const predictions = await storage.getDiseasePredictions();
      res.json({ predictions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disease predictions" });
    }
  });

  // Drug Recommendation Routes
  app.post("/api/drug-recommendation", async (req, res) => {
    try {
      const validatedData = insertDrugRecommendationSchema.parse(req.body);
      
      // Create recommendation record
      const recommendation = await storage.createDrugRecommendation(validatedData);
      
      // Get AI alternatives
      const alternatives = await findDrugAlternatives(
        validatedData.currentMedication,
        validatedData.reason || undefined,
        validatedData.medicalConditions || undefined
      );
      
      // Update recommendation with alternatives
      recommendation.alternatives = alternatives;
      
      res.json({ 
        success: true, 
        recommendation: {
          id: recommendation.id,
          ...alternatives
        }
      });
    } catch (error) {
      console.error("Drug recommendation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to find drug alternatives" 
      });
    }
  });

  app.get("/api/drug-recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getDrugRecommendations();
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drug recommendations" });
    }
  });

  // Heart Assessment Routes
  app.post("/api/heart-assessment", async (req, res) => {
    try {
      const validatedData = insertHeartAssessmentSchema.parse(req.body);
      
      // Create assessment record
      const assessment = await storage.createHeartAssessment(validatedData);
      
      // Get AI risk assessment
      const riskAssessment = await assessHeartRisk(validatedData);
      
      // Update assessment with risk data
      assessment.riskAssessment = riskAssessment;
      
      res.json({ 
        success: true, 
        assessment: {
          id: assessment.id,
          ...riskAssessment
        }
      });
    } catch (error) {
      console.error("Heart assessment error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to assess heart risk" 
      });
    }
  });

  app.get("/api/heart-assessments", async (req, res) => {
    try {
      const assessments = await storage.getHeartAssessments();
      res.json({ assessments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch heart assessments" });
    }
  });

  // Chat/MediBot Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Create user message
      const userMessage = await storage.createChatMessage({
        ...validatedData,
        isUser: true
      });
      
      // Get AI response
      const aiResponse = await generateMedicalResponse(validatedData.message);
      
      // Create AI message
      const aiMessage = await storage.createChatMessage({
        sessionId: validatedData.sessionId,
        message: aiResponse,
        isUser: false
      });
      
      res.json({ 
        success: true, 
        userMessage: {
          id: userMessage.id,
          message: userMessage.message,
          isUser: userMessage.isUser,
          createdAt: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          message: aiMessage.message,
          isUser: aiMessage.isUser,
          createdAt: aiMessage.createdAt
        }
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process chat message" 
      });
    }
  });

  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
