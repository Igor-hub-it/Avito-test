export interface Advertisement {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface OrderItem {
  advertisementId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CreateAdvertisementDto {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  views?: number;
  likes?: number;
  createdAt?: string;
}

export interface UpdateAdvertisementDto {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
}

export interface AdvertisementFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minViews?: number;
  maxViews?: number;
  minLikes?: number;
  maxLikes?: number;
  sortBy?: 'price' | 'views' | 'likes' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  start: number;
  limit: number;
}


