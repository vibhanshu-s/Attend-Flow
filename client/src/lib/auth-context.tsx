import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Admin, Teacher, Student } from "@shared/schema";

type UserRole = "admin" | "teacher" | "guardian" | null;

interface AuthState {
  role: UserRole;
  admin: Admin | null;
  teacher: Teacher | null;
  guardianMobile: string | null;
  selectedStudent: Student | null;
}

interface AuthContextType extends AuthState {
  loginAsAdmin: (admin: Admin) => void;
  loginAsTeacher: (teacher: Teacher) => void;
  loginAsGuardian: (mobile: string) => void;
  selectStudent: (student: Student) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "tuition_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { role: null, admin: null, teacher: null, guardianMobile: null, selectedStudent: null };
      }
    }
    return { role: null, admin: null, teacher: null, guardianMobile: null, selectedStudent: null };
  });

  const updateState = (updater: AuthState | ((prev: AuthState) => AuthState)) => {
    setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  const loginAsAdmin = (admin: Admin) => {
    updateState({ role: "admin", admin, teacher: null, guardianMobile: null, selectedStudent: null });
  };

  const loginAsTeacher = (teacher: Teacher) => {
    updateState({ role: "teacher", admin: null, teacher, guardianMobile: null, selectedStudent: null });
  };

  const loginAsGuardian = (mobile: string) => {
    updateState({ role: "guardian", admin: null, teacher: null, guardianMobile: mobile, selectedStudent: null });
  };

  const selectStudent = (student: Student) => {
    updateState(prev => ({ ...prev, selectedStudent: student }));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ role: null, admin: null, teacher: null, guardianMobile: null, selectedStudent: null });
  };

  const isAuthenticated = state.role !== null;

  return (
    <AuthContext.Provider value={{ ...state, loginAsAdmin, loginAsTeacher, loginAsGuardian, selectStudent, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
