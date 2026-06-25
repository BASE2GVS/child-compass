import type { ReactNode } from "react";
import { PremiumCard } from "@/components/design-system";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

export default function AppCard({ children, className = "", padding = "md" }: AppCardProps) {
  return (
    <PremiumCard className={className} padding={padding}>
      {children}
    </PremiumCard>
  );
}
