import { useNavigate } from 'react-router-dom';
import { Card, Image, Text, Group, Badge, Stack } from '@mantine/core';
import { IconAlertCircle, IconClock } from '@tabler/icons-react';
import { Advertisement, AdvertisementStatus } from '@/types';
import classes from './AdvertisementCard.module.css';

interface AdvertisementCardProps {
  advertisement: Advertisement;
}

export function AdvertisementCard({ advertisement }: AdvertisementCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/item/${advertisement.id}`);
  };

  const getStatusColor = (status: AdvertisementStatus): string => {
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

  const getStatusLabel = (status: AdvertisementStatus): string => {
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

  const imageUrl = advertisement.images && advertisement.images.length > 0
    ? advertisement.images[0]
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={classes.card}
      onClick={handleCardClick}
    >
      <Card.Section>
        <Image
          src={imageUrl}
          height={200}
          alt={advertisement.title}
          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
        />
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg" lineClamp={2} style={{ flex: 1 }}>
            {advertisement.title}
          </Text>
          {advertisement.priority === 'urgent' && (
            <Badge color="red" variant="filled" leftSection={<IconAlertCircle size={12} />}>
              Срочный
            </Badge>
          )}
        </Group>

        <Group justify="space-between" mt="xs">
          <Text fw={700} size="xl" c="blue">
            {advertisement.price.toLocaleString('ru-RU')} ₽
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Badge color={getStatusColor(advertisement.status)} variant="light" size="sm">
            {getStatusLabel(advertisement.status)}
          </Badge>
          <Badge variant="light" size="sm">
            {advertisement.category}
          </Badge>
        </Group>

        <Group gap="xs" c="dimmed">
          <IconClock size={14} />
          <Text size="xs">
            {new Date(advertisement.createdAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}

