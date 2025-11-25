import { 
  Advertisement, 
  AdvertisementFilters, 
  AdvertisementsResponse,
  RejectAdvertisementDto,
  RequestChangesDto
} from '@/types';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const advertisementsApi = {
  getAll: async (
    filters?: AdvertisementFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AdvertisementsResponse> => {
    const params = new URLSearchParams();
    
    // пагинация
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // поиск
    if (filters?.search) {
      params.append('search', filters.search);
    }

    // фильтр по статусу (множественный выбор)
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        params.append('status', status);
      });
    }

    // фильтр по категории
    if (filters?.categoryId !== undefined) {
      params.append('categoryId', filters.categoryId.toString());
    }

    // фильтр по цене
    if (filters?.minPrice !== undefined) {
      params.append('minPrice', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    // сортировка
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder || 'desc');
    }

    const url = `${API_BASE_URL}/ads?${params.toString()}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке объявлений');
      }
      const data: AdvertisementsResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что API сервер запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Объявление не найдено');
      }
      throw new Error('Ошибка при загрузке объявления');
    }
    return response.json();
  },

  approve: async (id: number): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Объявление не найдено');
      }
      throw new Error('Ошибка при одобрении объявления');
    }
    const data = await response.json();
    return data.ad;
  },

  reject: async (id: number, data: RejectAdvertisementDto): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Объявление не найдено');
      }
      if (response.status === 400) {
        throw new Error('Некорректные данные для отклонения');
      }
      throw new Error('Ошибка при отклонении объявления');
    }
    const result = await response.json();
    return result.ad;
  },

  requestChanges: async (id: number, data: RequestChangesDto): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}/request-changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Объявление не найдено');
      }
      if (response.status === 400) {
        throw new Error('Некорректные данные для запроса изменений');
      }
      throw new Error('Ошибка при запросе изменений');
    }
    const result = await response.json();
    return result.ad;
  },
};

