import { awsConfig } from '../config/aws-config';

/**
 * API Service
 * Utility functions for making API calls to AWS services
 */

// Base API URL from config
const API_URL = awsConfig.apiUrl;
const API_GATEWAY_ENDPOINT = awsConfig.apiGateway.endpoint;

// Helper function to get auth headers with token
const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper with error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API methods for reading materials
export const readingMaterialsApi = {
  // Get all reading materials
  getAll: async (token?: string) => {
    return fetchWithErrorHandling(`${API_GATEWAY_ENDPOINT}/files`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  },
  
  // Upload a reading material
  upload: async (file: File, metadata: any, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    return fetchWithErrorHandling(`${API_GATEWAY_ENDPOINT}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },
  
  // Delete a reading material
  delete: async (fileId: string, token: string) => {
    return fetchWithErrorHandling(`${API_GATEWAY_ENDPOINT}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  },
};

// API methods for generated content
export const generatedContentApi = {
  // Get all generated content
  getAll: async (token?: string) => {
    return fetchWithErrorHandling(`${API_GATEWAY_ENDPOINT}/content`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  },
  
  // Get a specific generated content
  getById: async (contentId: string, token?: string) => {
    return fetchWithErrorHandling(`${API_GATEWAY_ENDPOINT}/content/${contentId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  },
};

// Export all API services
export default {
  readingMaterials: readingMaterialsApi,
  generatedContent: generatedContentApi,
};
