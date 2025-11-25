// Типы для объявлений
export type AdvertisementStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type AdvertisementPriority = 'normal' | 'urgent';
export type ModerationAction = 'approved' | 'rejected' | 'requestChanges';

export interface Seller {
  id: number;
  name: string;
  rating: string;
  totalAds: number;
  registeredAt: string;
}

export interface ModerationHistory {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: ModerationAction;
  reason: string | null;
  comment: string;
  timestamp: string;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: AdvertisementStatus;
  priority: AdvertisementPriority;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: Seller;
  characteristics: Record<string, string>;
  moderationHistory: ModerationHistory[];
}

export interface AdvertisementFilters {
  search?: string;
  status?: AdvertisementStatus[];
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdvertisementsResponse {
  ads: Advertisement[];
  pagination: Pagination;
}

// Типы для модерации
export type RejectionReason = 
  | 'Запрещенный товар'
  | 'Неверная категория'
  | 'Некорректное описание'
  | 'Проблемы с фото'
  | 'Подозрение на мошенничество'
  | 'Другое';

export interface RejectAdvertisementDto {
  reason: RejectionReason;
  comment?: string;
}

export interface RequestChangesDto {
  reason: RejectionReason;
  comment?: string;
}

// Типы для статистики
export type StatsPeriod = 'today' | 'week' | 'month' | 'custom';

export interface StatsSummary {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
}

export interface ActivityData {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
}

export interface DecisionsData {
  approved: number;
  rejected: number;
  requestChanges: number;
}

export interface Moderator {
  id: number;
  name: string;
  email: string;
  role: string;
  statistics: ModeratorStats;
  permissions: string[];
}

export interface ModeratorStats {
  totalReviewed: number;
  todayReviewed: number;
  thisWeekReviewed: number;
  thisMonthReviewed: number;
  averageReviewTime: number;
  approvalRate: number;
}


