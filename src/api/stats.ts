import { StatsSummary, ActivityData, DecisionsData, StatsPeriod } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const statsApi = {
  getSummary: async (
    period?: StatsPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<StatsSummary> => {
    const params = new URLSearchParams();
    
    if (period) {
      params.append('period', period);
    }
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    }

    const url = `${API_BASE_URL}/stats/summary${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке статистики');
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что API сервер запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  getActivity: async (
    period?: StatsPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<ActivityData[]> => {
    const params = new URLSearchParams();
    
    if (period) {
      params.append('period', period);
    }
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    }

    const url = `${API_BASE_URL}/stats/chart/activity${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных активности');
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу');
      }
      throw error;
    }
  },

  getDecisions: async (
    period?: StatsPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<DecisionsData> => {
    const params = new URLSearchParams();
    
    if (period) {
      params.append('period', period);
    }
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    }

    const url = `${API_BASE_URL}/stats/chart/decisions${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных решений');
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу');
      }
      throw error;
    }
  },

  getCategories: async (
    period?: StatsPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, number>> => {
    const params = new URLSearchParams();
    
    if (period) {
      params.append('period', period);
    }
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    }

    const url = `${API_BASE_URL}/stats/chart/categories${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных по категориям');
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу');
      }
      throw error;
    }
  },
};

