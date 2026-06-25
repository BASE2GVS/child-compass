import type { ReactNode } from "react";

type WizardLayoutProps = {
  title?: string;
  children: ReactNode;
};

export default function WizardLayout({ children }: WizardLayoutProps) {
  return <div className="max-w-4xl mx-auto p-8">{children}</div>;
}
