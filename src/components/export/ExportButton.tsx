"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  href: string;
  label: string;
}

export function ExportButton({ href, label }: ExportButtonProps) {
  return (
    <a href={href} className="btn btn-secondary btn-sm inline-flex items-center">
      <Download className="w-4 h-4" />
      {label}
    </a>
  );
}
