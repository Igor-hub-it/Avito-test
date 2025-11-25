import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  Loader,
  Text,
  Alert,
  Card,
  Image,
  Table,
  Modal,
  Select,
  Textarea,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useForm } from '@mantine/form';
import { 
  IconArrowLeft, 
  IconAlertCircle, 
  IconCheck, 
  IconX, 
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { advertisementsApi } from '@/api/advertisements';
import { Advertisement, RejectAdvertisementDto, RequestChangesDto, RejectionReason } from '@/types';
import { useAbortController } from '@/hooks/useAbortController';
import classes from './AdvertisementPage.module.css';

const REJECTION_REASONS: RejectionReason[] = [
  'Запрещенный товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое',
];

export function AdvertisementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAbortController } = useAbortController();

  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [requestChangesModalOpened, setRequestChangesModalOpened] = useState(false);
  const [processing, setProcessing] = useState(false);

  const rejectForm = useForm<RejectAdvertisementDto>({
    initialValues: {
      reason: 'Запрещенный товар',
      comment: '',
    },
    validate: {
      reason: (value) => (!value ? 'Выберите причину' : null),
    },
  });

  const requestChangesForm = useForm<RequestChangesDto>({
    initialValues: {
      reason: 'Запрещенный товар',
      comment: '',
    },
    validate: {
      reason: (value) => (!value ? 'Выберите причину' : null),
    },
  });

  useEffect(() => {
    if (!id) {
      console.warn('ID объявления не передан');
      return;
    }

    const loadAdvertisement = async () => {
      setLoading(true);
      setError(null);

      try {
        const abortController = getAbortController();
        const advertisementId = Number(id);
        const data = await advertisementsApi.getById(advertisementId);
        
        if (!abortController.signal.aborted) {
          setAdvertisement(data);
        }
      } catch (err: any) {
        console.error('Ошибка загрузки объявления:', err);
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Не удалось загрузить объявление');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdvertisement();
  }, [id]);

  const handleApprove = async () => {
    if (!id || !advertisement) return;

    setProcessing(true);
    try {
      const updated = await advertisementsApi.approve(Number(id));
      setAdvertisement(updated);
      showNotification({
        title: 'Успешно',
        message: 'Объявление одобрено',
        color: 'green',
      });
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.message || 'Не удалось одобрить объявление',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (values: RejectAdvertisementDto) => {
    if (!id || !advertisement) return;

    setProcessing(true);
    try {
      const updated = await advertisementsApi.reject(Number(id), values);
      setAdvertisement(updated);
      setRejectModalOpened(false);
      rejectForm.reset();
      showNotification({
        title: 'Успешно',
        message: 'Объявление отклонено',
        color: 'red',
      });
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.message || 'Не удалось отклонить объявление',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestChanges = async (values: RequestChangesDto) => {
    if (!id || !advertisement) return;

    setProcessing(true);
    try {
      const updated = await advertisementsApi.requestChanges(Number(id), values);
      setAdvertisement(updated);
      setRequestChangesModalOpened(false);
      requestChangesForm.reset();
      showNotification({
        title: 'Успешно',
        message: 'Запрос изменений отправлен',
        color: 'yellow',
      });
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.message || 'Не удалось отправить запрос изменений',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'draft':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'На модерации';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'requestChanges':
        return 'Запрошены изменения';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error || !advertisement) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
          {error || 'Объявление не найдено'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/list')}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  const images = advertisement.images && advertisement.images.length > 0
    ? advertisement.images
    : ['https://via.placeholder.com/800x400?text=No+Image'];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/list')}
          >
            Назад к списку
          </Button>
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => {
                const prevId = Math.max(1, Number(id) - 1);
                navigate(`/item/${prevId}`);
              }}
            >
              Предыдущее
            </Button>
            <Button
              variant="subtle"
              rightSection={<IconChevronRight size={16} />}
              onClick={() => {
                const nextId = Number(id) + 1;
                navigate(`/item/${nextId}`);
              }}
            >
              Следующее
            </Button>
          </Group>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Title order={1}>{advertisement.title}</Title>
              <Group>
                <Badge color={getStatusColor(advertisement.status)} variant="light" size="lg">
                  {getStatusLabel(advertisement.status)}
                </Badge>
                {advertisement.priority === 'urgent' && (
                  <Badge color="red" variant="filled">
                    Срочный
                  </Badge>
                )}
              </Group>
            </Group>

            <Text fw={700} size="xl" c="blue">
              {advertisement.price.toLocaleString('ru-RU')} ₽
            </Text>

            <Badge variant="light">{advertisement.category}</Badge>

            {/* Галерея изображений */}
            <div>
              <Text fw={500} mb="xs">Изображения:</Text>
              {images.length > 1 ? (
                <Carousel
                  withIndicators
                  height={400}
                  slideSize="100%"
                  slideGap="md"
                  loop
                >
                  {images.map((img, index) => (
                    <Carousel.Slide key={index}>
                      <Image
                        src={img}
                        alt={`${advertisement.title} - изображение ${index + 1}`}
                        height={400}
                        fit="cover"
                        radius="md"
                        fallbackSrc="https://via.placeholder.com/800x400?text=No+Image"
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              ) : (
                <Image
                  src={images[0]}
                  alt={advertisement.title}
                  height={400}
                  fit="cover"
                  radius="md"
                  fallbackSrc="https://via.placeholder.com/800x400?text=No+Image"
                />
              )}
            </div>

            {/* Описание */}
            <div>
              <Text fw={500} mb="xs">Описание:</Text>
              <Text>{advertisement.description}</Text>
            </div>

            {/* Характеристики */}
            {Object.keys(advertisement.characteristics).length > 0 && (
              <div>
                <Text fw={500} mb="xs">Характеристики:</Text>
                <Table>
                  <Table.Tbody>
                    {Object.entries(advertisement.characteristics).map(([key, value]) => (
                      <Table.Tr key={key}>
                        <Table.Td fw={500}>{key}</Table.Td>
                        <Table.Td>{value}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}

            {/* Информация о продавце */}
            <Card withBorder padding="md">
              <Text fw={500} mb="md">Информация о продавце:</Text>
              <Stack gap="xs">
                <Text><strong>Имя:</strong> {advertisement.seller.name}</Text>
                <Text><strong>Рейтинг:</strong> {advertisement.seller.rating}</Text>
                <Text><strong>Количество объявлений:</strong> {advertisement.seller.totalAds}</Text>
                <Text><strong>Дата регистрации:</strong> {new Date(advertisement.seller.registeredAt).toLocaleDateString('ru-RU')}</Text>
              </Stack>
            </Card>

            {/* История модерации */}
            {advertisement.moderationHistory && advertisement.moderationHistory.length > 0 && (
              <div>
                <Text fw={500} mb="xs">История модерации:</Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Модератор</Table.Th>
                      <Table.Th>Действие</Table.Th>
                      <Table.Th>Причина</Table.Th>
                      <Table.Th>Комментарий</Table.Th>
                      <Table.Th>Дата</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {advertisement.moderationHistory.map((history) => (
                      <Table.Tr key={history.id}>
                        <Table.Td>{history.moderatorName}</Table.Td>
                        <Table.Td>{getActionLabel(history.action)}</Table.Td>
                        <Table.Td>{history.reason || '-'}</Table.Td>
                        <Table.Td>{history.comment || '-'}</Table.Td>
                        <Table.Td>{new Date(history.timestamp).toLocaleString('ru-RU')}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}

            <Text size="sm" c="dimmed">
              Создано: {new Date(advertisement.createdAt).toLocaleString('ru-RU')}
            </Text>
          </Stack>
        </Card>

        {/* Панель действий модератора */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">Действия модератора:</Text>
          <Group>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleApprove}
              loading={processing}
              disabled={advertisement.status === 'approved'}
            >
              Одобрить
            </Button>
            <Button
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => setRejectModalOpened(true)}
              loading={processing}
              disabled={advertisement.status === 'rejected'}
            >
              Отклонить
            </Button>
            <Button
              color="yellow"
              leftSection={<IconRefresh size={16} />}
              onClick={() => setRequestChangesModalOpened(true)}
              loading={processing}
            >
              Вернуть на доработку
            </Button>
          </Group>
        </Card>
      </Stack>

      {/* Модальное окно отклонения */}
      <Modal
        opened={rejectModalOpened}
        onClose={() => {
          setRejectModalOpened(false);
          rejectForm.reset();
        }}
        title="Отклонить объявление"
      >
        <form onSubmit={rejectForm.onSubmit(handleReject)}>
          <Stack gap="md">
            <Select
              label="Причина отклонения"
              placeholder="Выберите причину"
              data={REJECTION_REASONS}
              required
              {...rejectForm.getInputProps('reason')}
            />
            {rejectForm.values.reason === 'Другое' && (
              <Textarea
                label="Укажите причину"
                placeholder="Введите причину отклонения"
                required
                {...rejectForm.getInputProps('comment')}
              />
            )}
            {rejectForm.values.reason !== 'Другое' && (
              <Textarea
                label="Комментарий (необязательно)"
                placeholder="Дополнительный комментарий"
                {...rejectForm.getInputProps('comment')}
              />
            )}
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setRejectModalOpened(false);
                  rejectForm.reset();
                }}
                disabled={processing}
              >
                Отмена
              </Button>
              <Button type="submit" color="red" loading={processing}>
                Отклонить
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Модальное окно запроса изменений */}
      <Modal
        opened={requestChangesModalOpened}
        onClose={() => {
          setRequestChangesModalOpened(false);
          requestChangesForm.reset();
        }}
        title="Вернуть на доработку"
      >
        <form onSubmit={requestChangesForm.onSubmit(handleRequestChanges)}>
          <Stack gap="md">
            <Select
              label="Причина"
              placeholder="Выберите причину"
              data={REJECTION_REASONS}
              required
              {...requestChangesForm.getInputProps('reason')}
            />
            {requestChangesForm.values.reason === 'Другое' && (
              <Textarea
                label="Укажите причину"
                placeholder="Введите причину"
                required
                {...requestChangesForm.getInputProps('comment')}
              />
            )}
            {requestChangesForm.values.reason !== 'Другое' && (
              <Textarea
                label="Комментарий (необязательно)"
                placeholder="Дополнительный комментарий"
                {...requestChangesForm.getInputProps('comment')}
              />
            )}
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setRequestChangesModalOpened(false);
                  requestChangesForm.reset();
                }}
                disabled={processing}
              >
                Отмена
              </Button>
              <Button type="submit" color="yellow" loading={processing}>
                Отправить
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
