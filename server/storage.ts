import { eq, and, ne, lt, desc, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import {
  admins,
  teachers,
  batches,
  students,
  sessions,
  attendance,
  users,
} from "@shared/schema";
import type {
  Admin, InsertAdmin,
  Teacher, InsertTeacher,
  Batch, InsertBatch, BatchWithDetails,
  Student, InsertStudent, StudentWithAttendance,
  Session, InsertSession, SessionStatus,
  Attendance, AttendanceStatus,
  HeatmapData,
  User, InsertUser,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;

  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined>;
  getTeacherById(id: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;

  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatchById(id: string): Promise<Batch | undefined>;
  getAllBatches(): Promise<Batch[]>;
  getBatchesWithDetails(): Promise<BatchWithDetails[]>;
  getBatchesByTeacherId(teacherId: string): Promise<Batch[]>;

  createStudent(student: InsertStudent): Promise<Student>;
  getStudentById(id: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByBatchId(batchId: string): Promise<Student[]>;
  getStudentsByGuardianMobile(mobile: string): Promise<Student[]>;
  getStudentWithAttendance(studentId: string): Promise<StudentWithAttendance | undefined>;
  getStudentsWithAttendanceByBatchId(batchId: string): Promise<StudentWithAttendance[]>;
  getStudentHeatmap(studentId: string): Promise<HeatmapData[]>;

  createSession(session: InsertSession): Promise<Session>;
  getSessionById(id: string): Promise<Session | undefined>;
  getSessionsByBatchId(batchId: string): Promise<Session[]>;
  updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session | undefined>;
  lockExpiredSessions(): Promise<void>;

  createOrUpdateAttendance(sessionId: string, studentId: string, status: AttendanceStatus): Promise<Attendance>;
  getAttendanceBySessionId(sessionId: string): Promise<Attendance[]>;
  bulkUpdateAttendance(sessionId: string, status: AttendanceStatus): Promise<void>;

  getStats(): Promise<{ totalTeachers: number; totalBatches: number; totalStudents: number; totalSessions: number }>;
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

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const [teacher] = await db.insert(teachers).values(insertTeacher).returning();
    return teacher;
  }

  async getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.teacherId, teacherId));
    return teacher;
  }

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers);
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const [batch] = await db.insert(batches).values({
      name: insertBatch.name,
      description: insertBatch.description ?? null,
    }).returning();
    return batch;
  }

  async getBatchById(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  }

  async getAllBatches(): Promise<Batch[]> {
    return db.select().from(batches);
  }

  async getBatchesWithDetails(): Promise<BatchWithDetails[]> {
    const allBatches = await db.select().from(batches);
    const allStudents = await db.select().from(students);
    const allSessions = await db.select().from(sessions);

    return allBatches.map((batch) => {
      const studentCount = allStudents.filter(s => s.batchId === batch.id).length;
      const sessionCount = allSessions.filter(s => s.batchId === batch.id).length;
      return { ...batch, studentCount, sessionCount };
    });
  }

  async getBatchesByTeacherId(teacherId: string): Promise<Batch[]> {
    // Teachers can now work on any batch - return all batches
    return db.select().from(batches);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return db.select().from(students);
  }

  async getStudentsByBatchId(batchId: string): Promise<Student[]> {
    return db.select().from(students).where(eq(students.batchId, batchId));
  }

  async getStudentsByGuardianMobile(mobile: string): Promise<Student[]> {
    return db.select().from(students).where(eq(students.guardianMobile, mobile));
  }

  async getStudentWithAttendance(studentId: string): Promise<StudentWithAttendance | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) return undefined;

    const studentBatchSessions = await db.select().from(sessions)
      .where(and(eq(sessions.batchId, student.batchId), ne(sessions.status, "DRAFT")));

    const sessionIds = studentBatchSessions.map(s => s.id);
    
    let studentAttendance: Attendance[] = [];
    if (sessionIds.length > 0) {
      studentAttendance = await db.select().from(attendance)
        .where(and(
          eq(attendance.studentId, studentId),
          inArray(attendance.sessionId, sessionIds)
        ));
    }

    const presentSessions = studentAttendance.filter(a => a.status === "PRESENT").length;
    const totalSessions = studentBatchSessions.length;
    const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    return { ...student, attendancePercentage, totalSessions, presentSessions };
  }

  async getStudentsWithAttendanceByBatchId(batchId: string): Promise<StudentWithAttendance[]> {
    const batchStudents = await db.select().from(students).where(eq(students.batchId, batchId));
    const sessionsForBatch = await db.select().from(sessions)
      .where(and(eq(sessions.batchId, batchId), ne(sessions.status, "DRAFT")));

    const sessionIds = sessionsForBatch.map(s => s.id);
    
    let allAttendance: Attendance[] = [];
    if (sessionIds.length > 0) {
      allAttendance = await db.select().from(attendance)
        .where(inArray(attendance.sessionId, sessionIds));
    }

    return batchStudents.map(student => {
      const studentAttendance = allAttendance.filter(a => a.studentId === student.id);
      const presentSessions = studentAttendance.filter(a => a.status === "PRESENT").length;
      const totalSessions = sessionsForBatch.length;
      const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
      return { ...student, attendancePercentage, totalSessions, presentSessions };
    });
  }

  async getStudentHeatmap(studentId: string): Promise<HeatmapData[]> {
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) return [];

    const sessionsForBatch = await db.select().from(sessions)
      .where(and(eq(sessions.batchId, student.batchId), ne(sessions.status, "DRAFT")))
      .orderBy(desc(sessions.date))
      .limit(50);

    const sessionIds = sessionsForBatch.map(s => s.id);
    
    let studentAttendance: Attendance[] = [];
    if (sessionIds.length > 0) {
      studentAttendance = await db.select().from(attendance)
        .where(and(
          eq(attendance.studentId, studentId),
          inArray(attendance.sessionId, sessionIds)
        ));
    }

    return sessionsForBatch.map(session => {
      const record = studentAttendance.find(a => a.sessionId === session.id);
      return {
        sessionId: session.id,
        date: session.date,
        time: session.time,
        status: record?.status || "NOT_MARKED",
      };
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values({
      ...insertSession,
      status: "DRAFT",
      publishedAt: null,
    }).returning();
    return session;
  }

  async getSessionById(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessionsByBatchId(batchId: string): Promise<Session[]> {
    return db.select().from(sessions)
      .where(eq(sessions.batchId, batchId))
      .orderBy(desc(sessions.date));
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session | undefined> {
    const updateData: Partial<Session> = { status };
    if (status === "FINALIZED") {
      updateData.publishedAt = new Date().toISOString();
    }
    const [session] = await db.update(sessions)
      .set(updateData)
      .where(eq(sessions.id, sessionId))
      .returning();
    return session;
  }

  async lockExpiredSessions(): Promise<void> {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    
    await db.update(sessions)
      .set({ status: "LOCKED" })
      .where(and(
        eq(sessions.status, "FINALIZED"),
        lt(sessions.publishedAt, twelveHoursAgo)
      ));
  }

  async createOrUpdateAttendance(sessionId: string, studentId: string, status: AttendanceStatus): Promise<Attendance> {
    const [existing] = await db.select().from(attendance)
      .where(and(eq(attendance.sessionId, sessionId), eq(attendance.studentId, studentId)));

    if (existing) {
      const [updated] = await db.update(attendance)
        .set({ status })
        .where(eq(attendance.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(attendance).values({ sessionId, studentId, status }).returning();
    return created;
  }

  async getAttendanceBySessionId(sessionId: string): Promise<Attendance[]> {
    return db.select().from(attendance).where(eq(attendance.sessionId, sessionId));
  }

  async bulkUpdateAttendance(sessionId: string, status: AttendanceStatus): Promise<void> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) return;

    const batchStudents = await db.select().from(students).where(eq(students.batchId, session.batchId));
    
    for (const student of batchStudents) {
      await this.createOrUpdateAttendance(sessionId, student.id, status);
    }
  }

  async getStats(): Promise<{ totalTeachers: number; totalBatches: number; totalStudents: number; totalSessions: number }> {
    const [teacherCount] = await db.select({ count: sql<number>`count(*)::int` }).from(teachers);
    const [batchCount] = await db.select({ count: sql<number>`count(*)::int` }).from(batches);
    const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
    const [sessionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sessions);

    return {
      totalTeachers: teacherCount?.count || 0,
      totalBatches: batchCount?.count || 0,
      totalStudents: studentCount?.count || 0,
      totalSessions: sessionCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
