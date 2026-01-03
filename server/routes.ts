import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  signupAdminSchema,
  loginAdminSchema,
  loginTeacherSchema,
  loginGuardianSchema,
  insertTeacherSchema,
  insertBatchSchema,
  insertStudentSchema,
  insertSessionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.lockExpiredSessions();

  app.post("/api/admin/signup", async (req, res) => {
    try {
      const data = signupAdminSchema.parse(req.body);
      
      const existingAdmin = await storage.getAdminByEmail(data.email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin with this email already exists" });
      }

      const admin = await storage.createAdmin(data);
      const { password, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const data = loginAdminSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(data.email);
      if (!admin || admin.password !== data.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { password, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.post("/api/teacher/login", async (req, res) => {
    try {
      const data = loginTeacherSchema.parse(req.body);
      
      const teacher = await storage.getTeacherByTeacherId(data.teacherId);
      if (!teacher || teacher.password !== data.password) {
        return res.status(401).json({ message: "Invalid teacher ID or password" });
      }

      const { password, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/teachers", async (_req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const teachersWithoutPasswords = teachers.map(({ password, ...t }) => t);
      res.json(teachersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teachers" });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      
      const existingTeacher = await storage.getTeacherByTeacherId(data.teacherId);
      if (existingTeacher) {
        return res.status(400).json({ message: "Teacher ID already exists" });
      }

      const teacher = await storage.createTeacher(data);
      const { password, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create teacher" });
    }
  });

  app.get("/api/teacher/:teacherId/batches", async (req, res) => {
    try {
      const batches = await storage.getBatchesByTeacherId(req.params.teacherId);
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batches" });
    }
  });

  app.post("/api/guardian/login", async (req, res) => {
    try {
      const data = loginGuardianSchema.parse(req.body);
      
      const students = await storage.getStudentsByGuardianMobile(data.mobile);
      if (students.length === 0) {
        return res.status(404).json({ message: "No students linked to this mobile number" });
      }

      res.json({ students });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/guardian/students", async (req, res) => {
    try {
      const mobile = req.query.mobile as string;
      if (!mobile) {
        return res.status(400).json({ message: "Mobile number required" });
      }
      
      const students = await storage.getStudentsByGuardianMobile(mobile);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to get students" });
    }
  });

  app.get("/api/batches", async (_req, res) => {
    try {
      const batches = await storage.getBatchesWithDetails();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batches" });
    }
  });

  app.post("/api/batches", async (req, res) => {
    try {
      const data = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(data);
      res.json(batch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  app.get("/api/batches/:batchId/sessions", async (req, res) => {
    try {
      await storage.lockExpiredSessions();
      const sessions = await storage.getSessionsByBatchId(req.params.batchId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });

  app.get("/api/batches/:batchId/students", async (req, res) => {
    try {
      const students = await storage.getStudentsByBatchId(req.params.batchId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to get students" });
    }
  });

  app.get("/api/batches/:batchId/analytics", async (req, res) => {
    try {
      const students = await storage.getStudentsWithAttendanceByBatchId(req.params.batchId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to get students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.get("/api/students/:studentId/attendance", async (req, res) => {
    try {
      const studentData = await storage.getStudentWithAttendance(req.params.studentId);
      if (!studentData) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(studentData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get student attendance" });
    }
  });

  app.get("/api/students/:studentId/heatmap", async (req, res) => {
    try {
      const heatmapData = await storage.getStudentHeatmap(req.params.studentId);
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get heatmap data" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/sessions/:sessionId/attendance", async (req, res) => {
    try {
      const attendance = await storage.getAttendanceBySessionId(req.params.sessionId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to get attendance" });
    }
  });

  app.post("/api/sessions/:sessionId/attendance", async (req, res) => {
    try {
      const session = await storage.getSessionById(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status === "LOCKED") {
        return res.status(403).json({ message: "Session is locked" });
      }

      const today = new Date().toISOString().split("T")[0];
      if (session.status === "FINALIZED" && session.date !== today) {
        return res.status(403).json({ message: "Can only edit attendance on the same day" });
      }

      const { studentId, status } = req.body;
      const attendance = await storage.createOrUpdateAttendance(req.params.sessionId, studentId, status);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.post("/api/sessions/:sessionId/attendance/bulk", async (req, res) => {
    try {
      const session = await storage.getSessionById(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status === "LOCKED") {
        return res.status(403).json({ message: "Session is locked" });
      }

      const { status } = req.body;
      await storage.bulkUpdateAttendance(req.params.sessionId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk update attendance" });
    }
  });

  app.post("/api/sessions/:sessionId/finalize", async (req, res) => {
    try {
      const session = await storage.getSessionById(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status !== "DRAFT") {
        return res.status(400).json({ message: "Session is already finalized or locked" });
      }

      const updatedSession = await storage.updateSessionStatus(req.params.sessionId, "FINALIZED");
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to finalize session" });
    }
  });

  return httpServer;
}
