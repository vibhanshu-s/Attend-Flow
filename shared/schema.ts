import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: text("teacher_id").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teacherId: varchar("teacher_id").notNull(),
  description: text("description"),
});

export const insertBatchSchema = createInsertSchema(batches).omit({ id: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  batchId: varchar("batch_id").notNull(),
  guardianMobile: text("guardian_mobile").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type SessionStatus = "DRAFT" | "FINALIZED" | "LOCKED";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull(),
  teacherId: varchar("teacher_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().$type<SessionStatus>().default("DRAFT"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, status: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type AttendanceStatus = "PRESENT" | "ABSENT" | "NOT_MARKED";

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  studentId: varchar("student_id").notNull(),
  status: text("status").notNull().$type<AttendanceStatus>().default("NOT_MARKED"),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export const loginAdminSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginAdmin = z.infer<typeof loginAdminSchema>;

export const signupAdminSchema = insertAdminSchema.extend({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});
export type SignupAdmin = z.infer<typeof signupAdminSchema>;

export const loginTeacherSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginTeacher = z.infer<typeof loginTeacherSchema>;

export const loginGuardianSchema = z.object({
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});
export type LoginGuardian = z.infer<typeof loginGuardianSchema>;

export interface StudentWithAttendance extends Student {
  attendancePercentage: number;
  totalSessions: number;
  presentSessions: number;
}

export interface SessionWithAttendance extends Session {
  attendanceRecords: Attendance[];
}

export interface BatchWithDetails extends Batch {
  teacher?: Teacher;
  studentCount: number;
  sessionCount: number;
}

export interface HeatmapData {
  sessionId: string;
  date: string;
  time: string;
  status: AttendanceStatus;
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
