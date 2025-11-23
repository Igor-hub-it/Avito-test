import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
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
  Code,
} from '@mantine/core';
import { IconPlus, IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { AdvertisementCard } from '@/components/AdvertisementCard/AdvertisementCard';
import { CreateAdvertisementModal } from '@/components/CreateAdvertisementModal/CreateAdvertisementModal';
import { advertisementsApi } from '@/api/advertisements';
import { Advertisement, AdvertisementFilters } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useAbortController } from '@/hooks/useAbortController';
import classes from './AdvertisementsPage.module.css';

const ITEMS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
];

export function AdvertisementsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAbortController } = useAbortController();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('limit')) || 10);
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [minViews, setMinViews] = useState<number | undefined>(
    searchParams.get('minViews') ? Number(searchParams.get('minViews')) : undefined
  );
  const [maxViews, setMaxViews] = useState<number | undefined>(
    searchParams.get('maxViews') ? Number(searchParams.get('maxViews')) : undefined
  );
  const [minLikes, setMinLikes] = useState<number | undefined>(
    searchParams.get('minLikes') ? Number(searchParams.get('minLikes')) : undefined
  );
  const [maxLikes, setMaxLikes] = useState<number | undefined>(
    searchParams.get('maxLikes') ? Number(searchParams.get('maxLikes')) : undefined
  );
  const [sortBy, setSortBy] = useState<'price' | 'views' | 'likes' | 'createdAt' | ''>(
    (searchParams.get('sortBy') as any) || ''
  );
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(search, 500);

  const loadAdvertisements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const abortController = getAbortController(); // eslint-disable-line react-hooks/exhaustive-deps
      // TODO: возможно стоит кешировать фильтры
      const filters: AdvertisementFilters = {
        search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
        minPrice,
        maxPrice,
        minViews,
        maxViews,
        minLikes,
        maxLikes,
        sortBy: sortBy || undefined,
        sortOrder: 'desc',
      };

      const pagination = {
        start: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      console.log('Загружаю объявления с фильтрами:', filters); // для отладки
      const data = await advertisementsApi.getAll(filters, pagination);
      
      if (!abortController.signal.aborted) {
        setAdvertisements(data);
        // Для простоты считаем, что если вернулось меньше itemsPerPage, то это последняя страница
        // FIXME: это не совсем точно, но работает для тестового задания
        const newTotalCount = data.length < itemsPerPage 
          ? (currentPage - 1) * itemsPerPage + data.length 
          : currentPage * itemsPerPage + 1;
        setTotalCount(newTotalCount);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки:', err);
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = err.message || 'Что-то пошло не так';
        setError(errorMessage);
        // если сервер недоступен, показываем более понятное сообщение
        if (errorMessage.includes('подключиться к серверу')) {
          // можно добавить дополнительную информацию
        }
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, itemsPerPage, minPrice, maxPrice, minViews, maxViews, minLikes, maxLikes, sortBy]);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 10) params.set('limit', itemsPerPage.toString());
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
    if (minViews !== undefined) params.set('minViews', minViews.toString());
    if (maxViews !== undefined) params.set('maxViews', maxViews.toString());
    if (minLikes !== undefined) params.set('minLikes', minLikes.toString());
    if (maxLikes !== undefined) params.set('maxLikes', maxLikes.toString());
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentPage, itemsPerPage, minPrice, maxPrice, minViews, maxViews, minLikes, maxLikes, sortBy]);

  const handleCreate = async (data: Parameters<typeof advertisementsApi.create>[0]) => {
    try {
      // eslint-disable-next-line no-console
      console.log('Создаю объявление:', data);
      await advertisementsApi.create(data);
      loadAdvertisements();
      // TODO: добавить уведомление об успешном создании
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Не удалось создать объявление', error);
      // ошибка уже обработана в модалке
    }
  };

  const handleOrdersClick = (advertisementId: number) => {
    navigate(`/orders?advertisementId=${advertisementId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // скроллим вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // вычисляем количество страниц
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / itemsPerPage) : 1;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Объявления</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
          >
            Создать объявление
          </Button>
        </Group>

        <Group gap="md" align="flex-end">
          <TextInput
            placeholder="Поиск по названию (минимум 3 символа)"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            style={{ flex: 1 }}
          />
          <Select
            label="Сортировка"
            placeholder="Выберите поле"
            data={[
              { value: '', label: 'Без сортировки' },
              { value: 'price', label: 'По цене' },
              { value: 'views', label: 'По просмотрам' },
              { value: 'likes', label: 'По лайкам' },
              { value: 'createdAt', label: 'По дате создания' },
            ]}
            value={sortBy}
            onChange={(value) => setSortBy((value as any) || '')}
            clearable
          />
          <Select
            label="На странице"
            data={ITEMS_PER_PAGE_OPTIONS}
            value={itemsPerPage.toString()}
            onChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          />
        </Group>

        <Stack gap="md">
          <Title order={4}>Фильтры</Title>
          <Grid>
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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Мин. просмотры"
                placeholder="0"
                min={0}
                value={minViews || ''}
                onChange={(value) => setMinViews(typeof value === 'number' ? value : undefined)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Макс. просмотры"
                placeholder="Без ограничений"
                min={0}
                value={maxViews || ''}
                onChange={(value) => setMaxViews(typeof value === 'number' ? value : undefined)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Мин. лайки"
                placeholder="0"
                min={0}
                value={minLikes || ''}
                onChange={(value) => setMinLikes(typeof value === 'number' ? value : undefined)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Макс. лайки"
                placeholder="Без ограничений"
                min={0}
                value={maxLikes || ''}
                onChange={(value) => setMaxLikes(typeof value === 'number' ? value : undefined)}
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
                  <li>Откройте новый терминал</li>
                  <li>Перейдите в папку проекта</li>
                  <li>Выполните команду: <code>npm run server</code></li>
                  <li>Дождитесь сообщения "Resources http://localhost:3000/advertisements"</li>
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
            <Grid>
              {advertisements.map((advertisement: Advertisement) => {
                // рендерим карточку объявления
                return (
                  <Grid.Col key={advertisement.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <AdvertisementCard
                      advertisement={advertisement}
                      onOrdersClick={handleOrdersClick}
                    />
                  </Grid.Col>
                );
              })}
            </Grid>

            {totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={currentPage}
                  onChange={handlePageChange}
                  total={totalPages}
                />
              </Group>
            )}
          </>
        )}
      </Stack>

      <CreateAdvertisementModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSubmit={handleCreate}
      />
    </Container>
  );
}

