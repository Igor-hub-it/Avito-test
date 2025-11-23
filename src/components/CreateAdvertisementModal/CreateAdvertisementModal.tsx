import { useState } from 'react';
import { Modal, TextInput, NumberInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateAdvertisementDto } from '@/types';

interface CreateAdvertisementModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdvertisementDto) => Promise<void>;
}

export function CreateAdvertisementModal({
  opened,
  onClose,
  onSubmit,
}: CreateAdvertisementModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateAdvertisementDto>({
    initialValues: {
      name: '',
      price: 0,
      description: '',
      imageUrl: '',
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Название обязательно' : null),
      price: (value) => (value <= 0 ? 'Цена должна быть больше 0' : null),
    },
  });

  const handleSubmit = async (values: CreateAdvertisementDto) => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.log('Создаю объявление:', values);
      await onSubmit(values);
      form.reset(); // очищаем форму после успешного создания
      onClose();
      // TODO: можно добавить уведомление об успехе
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при создании объявления:', error);
      // FIXME: нужно показать ошибку пользователю
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Создать объявление" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Название"
            placeholder="Введите название объявления"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="URL изображения"
            placeholder="https://example.com/image.jpg"
            {...form.getInputProps('imageUrl')}
          />

          <NumberInput
            label="Стоимость"
            placeholder="Введите стоимость"
            required
            min={0}
            {...form.getInputProps('price')}
          />

          <Textarea
            label="Описание"
            placeholder="Введите описание объявления"
            rows={4}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={loading}>
              Создать
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

