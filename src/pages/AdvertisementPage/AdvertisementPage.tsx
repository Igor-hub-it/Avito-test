import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  TextInput,
  NumberInput,
  Textarea,
  Image,
  Group,
  Stack,
  Badge,
  Loader,
  Text,
  Alert,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconEye, IconHeart, IconAlertCircle, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { advertisementsApi } from '@/api/advertisements';
import { Advertisement, UpdateAdvertisementDto } from '@/types';
import { useAbortController } from '@/hooks/useAbortController';
import classes from './AdvertisementPage.module.css';

export function AdvertisementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAbortController } = useAbortController();

  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<UpdateAdvertisementDto>({
    initialValues: {
      name: '',
      price: 0,
      description: '',
      imageUrl: '',
    },
    validate: {
      name: (value) => (!value || value.trim().length < 1 ? 'Название обязательно' : null),
      price: (value) => (value !== undefined && value <= 0 ? 'Цена должна быть больше 0' : null),
    },
  });

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line no-console
      console.warn('ID объявления не передан');
      return;
    }

    const loadAdvertisement = async () => {
      setLoading(true);
      setError(null);

      try {
        const abortController = getAbortController();
        const advertisementId = Number(id); // преобразуем в число
        // eslint-disable-next-line no-console
        console.log('Загружаю объявление:', advertisementId);
        const data = await advertisementsApi.getById(advertisementId);
        
        if (!abortController.signal.aborted) {
          setAdvertisement(data);
          // заполняем форму данными
          form.setValues({
            name: data.name,
            price: data.price,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
          });
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Ошибка загрузки объявления:', err);
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Не удалось загрузить объявление');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdvertisement();
    // TODO: добавить cleanup функцию если нужно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (values: UpdateAdvertisementDto) => {
    if (!id) {
      // eslint-disable-next-line no-console
      console.error('ID не найден при сохранении');
      return;
    }

    setSaving(true);
    try {
      // eslint-disable-next-line no-console
      console.log('Сохраняю изменения:', values);
      const updated = await advertisementsApi.update(Number(id), values);
      setAdvertisement(updated);
      setEditing(false);
      // TODO: добавить уведомление об успешном сохранении
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Ошибка сохранения:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось сохранить изменения');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (advertisement) {
      form.setValues({
        name: advertisement.name,
        price: advertisement.price,
        description: advertisement.description || '',
        imageUrl: advertisement.imageUrl || '',
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error || !advertisement) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
          {error || 'Объявление не найдено'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/advertisements')}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/advertisements')}
        >
          Назад к списку
        </Button>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            {editing ? (
              <form onSubmit={form.onSubmit(handleSave)}>
                <Stack gap="md">
                  <TextInput
                    label="Название"
                    required
                    {...form.getInputProps('name')}
                  />

                  <TextInput
                    label="URL изображения"
                    {...form.getInputProps('imageUrl')}
                  />

                  <NumberInput
                    label="Стоимость"
                    required
                    min={0}
                    {...form.getInputProps('price')}
                  />

                  <Textarea
                    label="Описание"
                    rows={4}
                    {...form.getInputProps('description')}
                  />

                  <Group justify="flex-end">
                    <Button
                      variant="subtle"
                      leftSection={<IconX size={16} />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      leftSection={<IconCheck size={16} />}
                      loading={saving}
                    >
                      Сохранить
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <>
                <Group justify="space-between">
                  <Title order={1}>{advertisement.name}</Title>
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => setEditing(true)}
                  >
                    Редактировать
                  </Button>
                </Group>

                <Image
                  src={advertisement.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={advertisement.name}
                  radius="md"
                  fallbackSrc="https://via.placeholder.com/800x400?text=No+Image"
                />

                <Group gap="md">
                  <Badge leftSection={<IconEye size={14} />} variant="light" size="lg">
                    {advertisement.views} просмотров
                  </Badge>
                  <Badge leftSection={<IconHeart size={14} />} variant="light" color="red" size="lg">
                    {advertisement.likes} лайков
                  </Badge>
                </Group>

                <Text fw={700} size="xl" c="blue">
                  {advertisement.price.toLocaleString('ru-RU')} ₽
                </Text>

                {advertisement.description && (
                  <div>
                    <Text fw={500} mb="xs">Описание:</Text>
                    <Text>{advertisement.description}</Text>
                  </div>
                )}

                <Text size="sm" c="dimmed">
                  Создано: {new Date(advertisement.createdAt).toLocaleString('ru-RU')}
                </Text>
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

