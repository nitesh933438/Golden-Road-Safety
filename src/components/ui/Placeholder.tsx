import React from "react";
import { LucideIcon } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function Placeholder({ title, description, icon: Icon }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-surface-500 max-w-md mx-auto">{description}</p>
    </div>
  );
}
