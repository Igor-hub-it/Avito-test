import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Title,
  TextInput,
  Group,
  Grid,
  Select,
  Pagination,
  Stack,
  NumberInput,
  Loader,
  Text,
  Alert,
  MultiSelect,
  Button,
} from '@mantine/core';
import { IconSearch, IconAlertCircle, IconX } from '@tabler/icons-react';
import { AdvertisementCard } from '@/components/AdvertisementCard/AdvertisementCard';
import { advertisementsApi } from '@/api/advertisements';
import { Advertisement, AdvertisementFilters, AdvertisementStatus } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useAbortController } from '@/hooks/useAbortController';
import classes from './AdvertisementsPage.module.css';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'draft', label: 'Черновик' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'По дате создания' },
  { value: 'price', label: 'По цене' },
  { value: 'priority', label: 'По приоритету' },
];

export function AdvertisementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAbortController } = useAbortController();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [statusFilter, setStatusFilter] = useState<AdvertisementStatus[]>(
    searchParams.get('status')?.split(',') as AdvertisementStatus[] || []
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'priority'>(
    (searchParams.get('sortBy') as any) || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  const debouncedSearch = useDebounce(search, 500);

  const loadAdvertisements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const abortController = getAbortController();
      const filters: AdvertisementFilters = {
        search: debouncedSearch || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      };

      const response = await advertisementsApi.getAll(filters, currentPage, ITEMS_PER_PAGE);
      
      if (!abortController.signal.aborted) {
        setAdvertisements(response.ads);
        setPagination(response.pagination);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = err.message || 'Что-то пошло не так';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, statusFilter, categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (categoryId !== undefined) params.set('categoryId', categoryId.toString());
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, currentPage, statusFilter, categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter([]);
    setCategoryId(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter.length > 0 || categoryId !== undefined || 
    minPrice !== undefined || maxPrice !== undefined || search !== '';

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Список объявлений</Title>
          {hasActiveFilters && (
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          )}
        </Group>

        <Group gap="md" align="flex-end">
          <TextInput
            placeholder="Поиск по названию объявления"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <MultiSelect
            label="Статус"
            placeholder="Выберите статусы"
            data={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(values) => setStatusFilter(values as AdvertisementStatus[])}
            clearable
            style={{ minWidth: 200 }}
          />
          <Select
            label="Сортировка"
            data={SORT_OPTIONS}
            value={sortBy}
            onChange={(value) => setSortBy((value as any) || 'createdAt')}
          />
          <Select
            label="Порядок"
            data={[
              { value: 'desc', label: 'По убыванию' },
              { value: 'asc', label: 'По возрастанию' },
            ]}
            value={sortOrder}
            onChange={(value) => setSortOrder((value as 'asc' | 'desc') || 'desc')}
          />
        </Group>

        <Stack gap="md">
          <Title order={4}>Фильтры</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Категория (ID)"
                placeholder="ID категории"
                value={categoryId || ''}
                onChange={(value) => setCategoryId(typeof value === 'number' ? value : undefined)}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Мин. цена"
                placeholder="0"
                min={0}
                value={minPrice || ''}
                onChange={(value) => setMinPrice(typeof value === 'number' ? value : undefined)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Макс. цена"
                placeholder="Без ограничений"
                min={0}
                value={maxPrice || ''}
                onChange={(value) => setMaxPrice(typeof value === 'number' ? value : undefined)}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка подключения" 
            color="red"
          >
            {error}
            {error.includes('подключиться к серверу') && (
              <div style={{ marginTop: '1rem' }}>
                <Text size="sm" fw={500} mb="xs">Для решения проблемы:</Text>
                <Text size="sm" component="ol" style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Убедитесь, что API сервер запущен на http://localhost:3001</li>
                  <li>Обновите эту страницу</li>
                </Text>
              </div>
            )}
          </Alert>
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" />
          </Group>
        ) : advertisements.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Объявления не найдены
          </Text>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Всего объявлений: {pagination.totalItems}
            </Text>
            <Grid>
              {advertisements.map((advertisement) => (
                <Grid.Col key={advertisement.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <AdvertisementCard advertisement={advertisement} />
                </Grid.Col>
              ))}
            </Grid>

            {pagination.totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={currentPage}
                  onChange={handlePageChange}
                  total={pagination.totalPages}
                />
              </Group>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
