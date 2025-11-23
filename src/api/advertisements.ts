import { Advertisement, CreateAdvertisementDto, UpdateAdvertisementDto, AdvertisementFilters, PaginationParams } from '@/types';

const API_BASE_URL = 'http://localhost:3000';

export const advertisementsApi = {
  getAll: async (filters?: AdvertisementFilters, pagination?: PaginationParams): Promise<Advertisement[]> => {
    const params = new URLSearchParams();
    
    // добавляем пагинацию
    if (pagination) {
      params.append('_start', pagination.start.toString());
      params.append('_limit', pagination.limit.toString());
    }

    // поиск по названию
    if (filters?.search) {
      params.append('name_like', filters.search);
    }

    if (filters?.minPrice !== undefined) {
      params.append('price_gte', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('price_lte', filters.maxPrice.toString());
    }

    if (filters?.minViews !== undefined) {
      params.append('views_gte', filters.minViews.toString());
    }

    if (filters?.maxViews !== undefined) {
      params.append('views_lte', filters.maxViews.toString());
    }

    if (filters?.minLikes !== undefined) {
      params.append('likes_gte', filters.minLikes.toString());
    }

    if (filters?.maxLikes !== undefined) {
      params.append('likes_lte', filters.maxLikes.toString());
    }

    if (filters?.sortBy) {
      params.append('_sort', filters.sortBy);
      params.append('_order', filters.sortOrder || 'asc');
    }

    const url = `${API_BASE_URL}/advertisements?${params.toString()}`;
    // eslint-disable-next-line no-console
    console.log('Запрос к API:', url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // TODO: более детальная обработка ошибок
        throw new Error('Ошибка при загрузке объявлений');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что API сервер запущен на http://localhost:3000');
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`);
    if (!response.ok) {
      throw new Error('Объявление не найдено');
    }
    return response.json();
  },

  create: async (data: CreateAdvertisementDto): Promise<Advertisement> => {
    // подготавливаем данные для отправки
    const payload = {
      ...data,
      views: data.views || 0, // по умолчанию 0 просмотров
      likes: data.likes || 0, // по умолчанию 0 лайков
      createdAt: data.createdAt || new Date().toISOString(), // текущая дата если не указана
    };
    
    const response = await fetch(`${API_BASE_URL}/advertisements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      // FIXME: можно вернуть более детальную ошибку от сервера
      throw new Error('Ошибка при создании объявления');
    }
    return response.json();
  },

  update: async (id: number, data: UpdateAdvertisementDto): Promise<Advertisement> => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Ошибка при обновлении объявления');
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка при удалении объявления');
    }
  },
};

