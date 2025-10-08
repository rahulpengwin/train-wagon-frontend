import axios, { AxiosResponse } from 'axios';
import { DetectionResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

export const apiService = {
  uploadAndDetect: async (
    file: File,
    enhancedAccuracy: boolean = true,
    highPrecision: boolean = true
  ): Promise<DetectionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enhanced_accuracy', enhancedAccuracy.toString());
    formData.append('high_precision', highPrecision.toString());

    const response: AxiosResponse<DetectionResponse> = await api.post(
      '/api/detection/upload-and-detect',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  getHistory: async (limit: number = 50, status?: string) => {
    const params: any = { limit };
    if (status) params.status = status;
    const response = await api.get('/api/detection/history', { params });
    return response.data;
  },

  getModelInfo: async () => {
    const response = await api.get('/api/detection/model-info');
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get('/api/detection/health-check');
    return response.data;
  },
};

export default apiService;