import { Badge } from "@/components/ui/badge";
import { FileEdit, CheckCircle, Lock } from "lucide-react";
import type { SessionStatus } from "@shared/schema";

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = {
    DRAFT: {
      label: "Draft",
      variant: "secondary" as const,
      icon: FileEdit,
    },
    FINALIZED: {
      label: "Finalized",
      variant: "default" as const,
      icon: CheckCircle,
    },
    LOCKED: {
      label: "Published",
      variant: "default" as const,
      icon: CheckCircle,
    },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
