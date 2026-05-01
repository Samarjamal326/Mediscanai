import { 
  type User, 
  type InsertUser,
  type DiseasePrediction,
  type InsertDiseasePrediction,
  type DrugRecommendation,
  type InsertDrugRecommendation,
  type HeartAssessment,
  type InsertHeartAssessment,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Disease Predictions
  createDiseasePrediction(prediction: InsertDiseasePrediction & { userId?: string }): Promise<DiseasePrediction>;
  getDiseasePredictions(userId?: string): Promise<DiseasePrediction[]>;

  // Drug Recommendations
  createDrugRecommendation(recommendation: InsertDrugRecommendation & { userId?: string }): Promise<DrugRecommendation>;
  getDrugRecommendations(userId?: string): Promise<DrugRecommendation[]>;

  // Heart Assessments
  createHeartAssessment(assessment: InsertHeartAssessment & { userId?: string }): Promise<HeartAssessment>;
  getHeartAssessments(userId?: string): Promise<HeartAssessment[]>;

  // Chat Messages
  createChatMessage(message: InsertChatMessage & { userId?: string }): Promise<ChatMessage>;
  getChatMessages(sessionId: string, userId?: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private diseasePredictions: Map<string, DiseasePrediction>;
  private drugRecommendations: Map<string, DrugRecommendation>;
  private heartAssessments: Map<string, HeartAssessment>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.diseasePredictions = new Map();
    this.drugRecommendations = new Map();
    this.heartAssessments = new Map();
    this.chatMessages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createDiseasePrediction(prediction: InsertDiseasePrediction & { userId?: string }): Promise<DiseasePrediction> {
    const id = randomUUID();
    const diseasePrediction: DiseasePrediction = {
      ...prediction,
      id,
      prediction: null,
      createdAt: new Date()
    };
    this.diseasePredictions.set(id, diseasePrediction);
    return diseasePrediction;
  }

  async getDiseasePredictions(userId?: string): Promise<DiseasePrediction[]> {
    const predictions = Array.from(this.diseasePredictions.values());
    if (userId) {
      return predictions.filter(p => p.userId === userId);
    }
    return predictions;
  }

  async createDrugRecommendation(recommendation: InsertDrugRecommendation & { userId?: string }): Promise<DrugRecommendation> {
    const id = randomUUID();
    const drugRecommendation: DrugRecommendation = {
      ...recommendation,
      id,
      alternatives: null,
      createdAt: new Date()
    };
    this.drugRecommendations.set(id, drugRecommendation);
    return drugRecommendation;
  }

  async getDrugRecommendations(userId?: string): Promise<DrugRecommendation[]> {
    const recommendations = Array.from(this.drugRecommendations.values());
    if (userId) {
      return recommendations.filter(r => r.userId === userId);
    }
    return recommendations;
  }

  async createHeartAssessment(assessment: InsertHeartAssessment & { userId?: string }): Promise<HeartAssessment> {
    const id = randomUUID();
    const heartAssessment: HeartAssessment = {
      ...assessment,
      id,
      riskAssessment: null,
      createdAt: new Date()
    };
    this.heartAssessments.set(id, heartAssessment);
    return heartAssessment;
  }

  async getHeartAssessments(userId?: string): Promise<HeartAssessment[]> {
    const assessments = Array.from(this.heartAssessments.values());
    if (userId) {
      return assessments.filter(a => a.userId === userId);
    }
    return assessments;
  }

  async createChatMessage(message: InsertChatMessage & { userId?: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const chatMessage: ChatMessage = {
      ...message,
      id,
      response: null,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatMessages(sessionId: string, userId?: string): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    let filtered = messages.filter(m => m.sessionId === sessionId);
    if (userId) {
      filtered = filtered.filter(m => m.userId === userId);
    }
    return filtered.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }
}

export const storage = new MemStorage();
