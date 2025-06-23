import type { APIPayload, APIResponse } from '../types';
import { ERROR_MESSAGES } from '../constants/validation';

export const apiService = {
  async processUUIDs(data: APIPayload): Promise<APIResponse> {
    try {
      const response = await fetch('/api/process-uuids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as APIResponse;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(ERROR_MESSAGES.BACKEND_ERROR);
    }
  },

  async simulateProcessUUIDs(data: APIPayload): Promise<APIResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📤 Enviando para backend (Estrutura Modular):', data);
        resolve({
          success: true,
          processedCount: data.validUUIDs.length,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    });
  }
};
