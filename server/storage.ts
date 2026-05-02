import { 
  users, type User, type InsertUser,
  diseasePredictions, type DiseasePrediction, type InsertDiseasePrediction,
  drugRecommendations, type DrugRecommendation, type InsertDrugRecommendation,
  heartAssessments, type HeartAssessment, type InsertHeartAssessment,
  chatMessages, type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createDiseasePrediction(prediction: InsertDiseasePrediction & { userId?: string }): Promise<DiseasePrediction> {
    const [record] = await db.insert(diseasePredictions).values(prediction).returning();
    return record;
  }

  async getDiseasePredictions(userId?: string): Promise<DiseasePrediction[]> {
    if (userId) {
      return db.select().from(diseasePredictions).where(eq(diseasePredictions.userId, userId));
    }
    return db.select().from(diseasePredictions);
  }

  async createDrugRecommendation(recommendation: InsertDrugRecommendation & { userId?: string }): Promise<DrugRecommendation> {
    const [record] = await db.insert(drugRecommendations).values(recommendation).returning();
    return record;
  }

  async getDrugRecommendations(userId?: string): Promise<DrugRecommendation[]> {
    if (userId) {
      return db.select().from(drugRecommendations).where(eq(drugRecommendations.userId, userId));
    }
    return db.select().from(drugRecommendations);
  }

  async createHeartAssessment(assessment: InsertHeartAssessment & { userId?: string }): Promise<HeartAssessment> {
    const [record] = await db.insert(heartAssessments).values(assessment).returning();
    return record;
  }

  async getHeartAssessments(userId?: string): Promise<HeartAssessment[]> {
    if (userId) {
      return db.select().from(heartAssessments).where(eq(heartAssessments.userId, userId));
    }
    return db.select().from(heartAssessments);
  }

  async createChatMessage(message: InsertChatMessage & { userId?: string }): Promise<ChatMessage> {
    const [record] = await db.insert(chatMessages).values(message).returning();
    return record;
  }

  async getChatMessages(sessionId: string, userId?: string): Promise<ChatMessage[]> {
    let query = db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId));
    const results = await query;
    if (userId) {
      return results.filter(m => m.userId === userId).sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    }
    return results.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }
}

export const storage = new DatabaseStorage();
