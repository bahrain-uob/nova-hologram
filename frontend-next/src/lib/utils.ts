import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';
import { CLIENT_SECRET } from '@/app/aws-config';

export function getSecretHash(username: string, clientId: string) {
    return crypto
        .createHmac('SHA256', CLIENT_SECRET)
        .update(username + clientId)
        .digest('base64');
}

export function getUserPoolId(region: string, userPoolId: string) {
    return `cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
