import axios, { AxiosInstance } from 'axios';
import { AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class APIClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/oauth/google', { code });
    return response.data;
  }

  // Project endpoints
  async getProjects() {
    const response = await this.client.get('/projects');
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}`);
    return response.data;
  }

  async createProject(data: { name: string; description: string; visibility: string }) {
    const response = await this.client.post('/projects', data);
    return response.data;
  }

  // Board endpoints
  async createBoard(projectId: string, data: { name: string }) {
    const response = await this.client.post(`/projects/${projectId}/boards`, data);
    return response.data;
  }

  async updateBoard(projectId: string, boardId: string, data: { name: string }) {
    const response = await this.client.put(`/projects/${projectId}/boards/${boardId}`, data);
    return response.data;
  }

  async deleteBoard(projectId: string, boardId: string) {
    const response = await this.client.delete(`/projects/${projectId}/boards/${boardId}`);
    return response.data;
  }

  // Column endpoints
  async createColumn(projectId: string, boardId: string, data: { name: string; order: number }) {
    const response = await this.client.post(
      `/projects/${projectId}/boards/${boardId}/columns`,
      data
    );
    return response.data;
  }

  async updateColumn(
    projectId: string,
    boardId: string,
    columnId: string,
    data: { name?: string; order?: number }
  ) {
    const response = await this.client.put(
      `/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
      data
    );
    return response.data;
  }

  async deleteColumn(projectId: string, boardId: string, columnId: string) {
    const response = await this.client.delete(
      `/projects/${projectId}/boards/${boardId}/columns/${columnId}`
    );
    return response.data;
  }

  // Card endpoints
  async createCard(
    projectId: string,
    boardId: string,
    columnId: string,
    data: {
      title: string;
      description?: string;
      order: number;
    }
  ) {
    const response = await this.client.post(
      `/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards`,
      data
    );
    return response.data;
  }

  async updateCard(
    projectId: string,
    boardId: string,
    columnId: string,
    cardId: string,
    data: {
      title?: string;
      description?: string;
      order?: number;
      columnId?: string;
    }
  ) {
    const response = await this.client.put(
      `/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
      data
    );
    return response.data;
  }

  async deleteCard(projectId: string, boardId: string, columnId: string, cardId: string) {
    const response = await this.client.delete(
      `/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`
    );
    return response.data;
  }

  async moveCard(
    projectId: string,
    boardId: string,
    cardId: string,
    data: {
      sourceColumnId: string;
      targetColumnId: string;
      newOrder?: number;
    }
  ) {
    const response = await this.client.put(
      `/projects/${projectId}/boards/${boardId}/cards/${cardId}/move`,
      data
    );
    return response.data;
  }

  // Notification endpoints
  async getNotifications(limit = 20, offset = 0) {
    const response = await this.client.get('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.client.put(`/notifications/${notificationId}/read`);
    return response.data;
  }
}

export const apiClient = new APIClient();
