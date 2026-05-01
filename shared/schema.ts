import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diseasePredictions = pgTable("disease_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  symptoms: text("symptoms").array().notNull(),
  additionalInfo: text("additional_info"),
  prediction: jsonb("prediction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drugRecommendations = pgTable("drug_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  currentMedication: text("current_medication").notNull(),
  reason: text("reason"),
  medicalConditions: text("medical_conditions"),
  alternatives: jsonb("alternatives"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const heartAssessments = pgTable("heart_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  smoker: boolean("smoker").default(false),
  regularExercise: boolean("regular_exercise").default(false),
  highStress: boolean("high_stress").default(false),
  familyHistory: boolean("family_history").default(false),
  diabetes: boolean("diabetes").default(false),
  highBloodPressure: boolean("high_blood_pressure").default(false),
  highCholesterol: boolean("high_cholesterol").default(false),
  riskAssessment: jsonb("risk_assessment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionId: varchar("session_id").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  isUser: boolean("is_user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertDiseasePredictionSchema = createInsertSchema(diseasePredictions).pick({
  symptoms: true,
  additionalInfo: true,
});

export const insertDrugRecommendationSchema = createInsertSchema(drugRecommendations).pick({
  currentMedication: true,
  reason: true,
  medicalConditions: true,
});

export const insertHeartAssessmentSchema = createInsertSchema(heartAssessments).pick({
  age: true,
  gender: true,
  height: true,
  weight: true,
  smoker: true,
  regularExercise: true,
  highStress: true,
  familyHistory: true,
  diabetes: true,
  highBloodPressure: true,
  highCholesterol: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  message: true,
  isUser: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiseasePrediction = z.infer<typeof insertDiseasePredictionSchema>;
export type DiseasePrediction = typeof diseasePredictions.$inferSelect;

export type InsertDrugRecommendation = z.infer<typeof insertDrugRecommendationSchema>;
export type DrugRecommendation = typeof drugRecommendations.$inferSelect;

export type InsertHeartAssessment = z.infer<typeof insertHeartAssessmentSchema>;
export type HeartAssessment = typeof heartAssessments.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
