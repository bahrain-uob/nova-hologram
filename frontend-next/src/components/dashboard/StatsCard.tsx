import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="text-primary/20">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold">{value}</h2>
      </CardContent>
    </Card>
  );
}
