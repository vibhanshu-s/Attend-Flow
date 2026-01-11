import { Button } from "@/components/ui/button";
import { Check, X, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { AttendanceStatus } from "@shared/schema";

interface AttendanceToggleProps {
  status: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  studentId: string;
}

export function AttendanceToggle({ status, onStatusChange, disabled = false, studentId }: AttendanceToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <Button
          variant={status === "PRESENT" ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange("PRESENT")}
          disabled={disabled}
          className={`transition-all duration-200 ${status === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/25" : ""}`}
          data-testid={`button-present-${studentId}`}
        >
          <Check className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <Button
          variant={status === "ABSENT" ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange("ABSENT")}
          disabled={disabled}
          className={`transition-all duration-200 ${status === "ABSENT" ? "bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/25" : ""}`}
          data-testid={`button-absent-${studentId}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <Button
          variant={status === "NOT_MARKED" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onStatusChange("NOT_MARKED")}
          disabled={disabled}
          className="transition-all duration-200"
          data-testid={`button-not-marked-${studentId}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
