import { randomUUID } from "crypto";
import type {
  Admin, InsertAdmin,
  Teacher, InsertTeacher,
  Batch, InsertBatch, BatchWithDetails,
  Student, InsertStudent, StudentWithAttendance,
  Session, InsertSession, SessionStatus,
  Attendance, InsertAttendance, AttendanceStatus,
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private admins: Map<string, Admin>;
  private teachers: Map<string, Teacher>;
  private batches: Map<string, Batch>;
  private students: Map<string, Student>;
  private sessions: Map<string, Session>;
  private attendanceRecords: Map<string, Attendance>;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.teachers = new Map();
    this.batches = new Map();
    this.students = new Map();
    this.sessions = new Map();
    this.attendanceRecords = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find((admin) => admin.email === email);
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { ...insertTeacher, id };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find((teacher) => teacher.teacherId === teacherId);
  }

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = randomUUID();
    const batch: Batch = { 
      id,
      name: insertBatch.name,
      teacherId: insertBatch.teacherId,
      description: insertBatch.description ?? null,
    };
    this.batches.set(id, batch);
    return batch;
  }

  async getBatchById(id: string): Promise<Batch | undefined> {
    return this.batches.get(id);
  }

  async getAllBatches(): Promise<Batch[]> {
    return Array.from(this.batches.values());
  }

  async getBatchesWithDetails(): Promise<BatchWithDetails[]> {
    const batches = Array.from(this.batches.values());
    return batches.map((batch) => {
      const teacher = this.teachers.get(batch.teacherId);
      const studentCount = Array.from(this.students.values()).filter((s) => s.batchId === batch.id).length;
      const sessionCount = Array.from(this.sessions.values()).filter((s) => s.batchId === batch.id).length;
      return { ...batch, teacher, studentCount, sessionCount };
    });
  }

  async getBatchesByTeacherId(teacherId: string): Promise<Batch[]> {
    return Array.from(this.batches.values()).filter((batch) => batch.teacherId === teacherId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsByBatchId(batchId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter((student) => student.batchId === batchId);
  }

  async getStudentsByGuardianMobile(mobile: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter((student) => student.guardianMobile === mobile);
  }

  async getStudentWithAttendance(studentId: string): Promise<StudentWithAttendance | undefined> {
    const student = this.students.get(studentId);
    if (!student) return undefined;

    const studentBatchSessions = Array.from(this.sessions.values()).filter(
      (s) => s.batchId === student.batchId && s.status !== "DRAFT"
    );

    const studentAttendance = Array.from(this.attendanceRecords.values()).filter(
      (a) => a.studentId === studentId && studentBatchSessions.some((s) => s.id === a.sessionId)
    );

    const presentSessions = studentAttendance.filter((a) => a.status === "PRESENT").length;
    const totalSessions = studentBatchSessions.length;
    const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    return { ...student, attendancePercentage, totalSessions, presentSessions };
  }

  async getStudentsWithAttendanceByBatchId(batchId: string): Promise<StudentWithAttendance[]> {
    const students = await this.getStudentsByBatchId(batchId);
    const sessionsForBatch = Array.from(this.sessions.values()).filter(
      (s) => s.batchId === batchId && s.status !== "DRAFT"
    );

    return students.map((student) => {
      const studentAttendance = Array.from(this.attendanceRecords.values()).filter(
        (a) => a.studentId === student.id && sessionsForBatch.some((s) => s.id === a.sessionId)
      );

      const presentSessions = studentAttendance.filter((a) => a.status === "PRESENT").length;
      const totalSessions = sessionsForBatch.length;
      const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

      return { ...student, attendancePercentage, totalSessions, presentSessions };
    });
  }

  async getStudentHeatmap(studentId: string): Promise<HeatmapData[]> {
    const student = this.students.get(studentId);
    if (!student) return [];

    const sessionsForBatch = Array.from(this.sessions.values())
      .filter((s) => s.batchId === student.batchId && s.status !== "DRAFT")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    return sessionsForBatch.map((session) => {
      const attendanceRecord = Array.from(this.attendanceRecords.values()).find(
        (a) => a.sessionId === session.id && a.studentId === studentId
      );

      return {
        sessionId: session.id,
        date: session.date,
        time: session.time,
        status: attendanceRecord?.status || "NOT_MARKED",
      };
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { ...insertSession, id, status: "DRAFT", publishedAt: null };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionById(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByBatchId(batchId: string): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter((session) => session.batchId === batchId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.status = status;
    if (status === "FINALIZED" && !session.publishedAt) {
      session.publishedAt = new Date().toISOString();
    }
    this.sessions.set(sessionId, session);
    return session;
  }

  async lockExpiredSessions(): Promise<void> {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    const sessions = Array.from(this.sessions.values());
    for (const session of sessions) {
      if (session.status === "FINALIZED" && session.publishedAt) {
        const publishedAt = new Date(session.publishedAt);
        if (publishedAt < twelveHoursAgo) {
          session.status = "LOCKED";
          this.sessions.set(session.id, session);
        }
      }
    }
  }

  async createOrUpdateAttendance(sessionId: string, studentId: string, status: AttendanceStatus): Promise<Attendance> {
    const existingKey = Array.from(this.attendanceRecords.entries()).find(
      ([, a]) => a.sessionId === sessionId && a.studentId === studentId
    )?.[0];

    if (existingKey) {
      const existing = this.attendanceRecords.get(existingKey)!;
      existing.status = status;
      this.attendanceRecords.set(existingKey, existing);
      return existing;
    }

    const id = randomUUID();
    const attendance: Attendance = { id, sessionId, studentId, status };
    this.attendanceRecords.set(id, attendance);
    return attendance;
  }

  async getAttendanceBySessionId(sessionId: string): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter((a) => a.sessionId === sessionId);
  }

  async bulkUpdateAttendance(sessionId: string, status: AttendanceStatus): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const students = await this.getStudentsByBatchId(session.batchId);
    for (const student of students) {
      await this.createOrUpdateAttendance(sessionId, student.id, status);
    }
  }

  async getStats(): Promise<{ totalTeachers: number; totalBatches: number; totalStudents: number; totalSessions: number }> {
    return {
      totalTeachers: this.teachers.size,
      totalBatches: this.batches.size,
      totalStudents: this.students.size,
      totalSessions: this.sessions.size,
    };
  }
}

export const storage = new MemStorage();
