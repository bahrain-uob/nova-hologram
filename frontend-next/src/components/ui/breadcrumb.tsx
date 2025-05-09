import * as React from "react";
import { ChevronRight } from "lucide-react";

export function BreadcrumbList({ children }: { children: React.ReactNode }) {
  return <nav className="flex items-center space-x-1 text-sm">{children}</nav>;
}

export function BreadcrumbItem({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center">{children}</div>;
}

export function BreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

export function BreadcrumbSeparator() {
  return <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />;
}

// Optional convenience wrapper
export const Breadcrumb = {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Separator: BreadcrumbSeparator,
};
