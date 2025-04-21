import React from "react";

interface CircularDeterminateProgressIndicatorProps {
  className?: string;
  progress?: number;
}

export const CircularDeterminateProgressIndicator: React.FC<CircularDeterminateProgressIndicatorProps> = ({
  className = "",
  progress = 70,
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className="text-indigo-600"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease 0s",
          }}
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  );
};
