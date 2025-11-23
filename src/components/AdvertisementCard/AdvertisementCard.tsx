import { useNavigate } from 'react-router-dom';
import { Card, Image, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconEye, IconHeart, IconShoppingBag } from '@tabler/icons-react';
import { Advertisement } from '@/types';
import classes from './AdvertisementCard.module.css';

interface AdvertisementCardProps {
  advertisement: Advertisement;
  onOrdersClick?: (advertisementId: number) => void;
}

export function AdvertisementCard({ advertisement, onOrdersClick }: AdvertisementCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // переходим на страницу объявления
    navigate(`/advertisements/${advertisement.id}`);
  };

  const handleOrdersClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // предотвращаем всплытие события
    if (onOrdersClick) {
      onOrdersClick(advertisement.id);
    }
  };

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
          src={advertisement.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
          height={200}
          alt={advertisement.name}
          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
        />
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Text fw={500} size="lg" lineClamp={2}>
          {advertisement.name}
        </Text>

        {advertisement.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {advertisement.description}
          </Text>
        )}

        <Group justify="space-between" mt="xs">
          <Text fw={700} size="xl" c="blue">
            {advertisement.price.toLocaleString('ru-RU')} ₽
          </Text>
          {/* можно добавить скидку здесь */}
        </Group>

        <Group gap="md">
          <Badge leftSection={<IconEye size={14} />} variant="light">
            {advertisement.views}
          </Badge>
          <Badge leftSection={<IconHeart size={14} />} variant="light" color="red">
            {advertisement.likes}
          </Badge>
        </Group>

        {onOrdersClick && (
          <Button
            variant="light"
            color="blue"
            fullWidth
            mt="md"
            leftSection={<IconShoppingBag size={16} />}
            onClick={handleOrdersClick}
          >
            Заказы
          </Button>
        )}
      </Stack>
    </Card>
  );
}

