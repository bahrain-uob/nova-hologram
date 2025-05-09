import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function getUserPoolId(region: string, userPoolId: string) {
  return `cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
