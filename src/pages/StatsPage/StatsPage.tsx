import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Group,
  Stack,
  Text,
  Loader,
  Alert,
  Select,
  Grid,
  Progress,
  RingProgress,
  Paper,
} from '@mantine/core';
import { IconAlertCircle, IconTrendingUp } from '@tabler/icons-react';
import { statsApi } from '@/api/stats';
import { StatsSummary, ActivityData, DecisionsData, StatsPeriod } from '@/types';
import { useAbortController } from '@/hooks/useAbortController';
import classes from './StatsPage.module.css';

export function StatsPage() {
  const { getAbortController } = useAbortController();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [decisions, setDecisions] = useState<DecisionsData | null>(null);
  const [categories, setCategories] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const abortController = getAbortController();
        const [summaryData, activityData, decisionsData, categoriesData] = await Promise.all([
          statsApi.getSummary(period),
          statsApi.getActivity(period),
          statsApi.getDecisions(period),
          statsApi.getCategories(period),
        ]);

        if (!abortController.signal.aborted) {
          setSummary(summaryData);
          setActivity(activityData);
          setDecisions(decisionsData);
          setCategories(categoriesData);
        }
      } catch (err: any) {
        console.error('Ошибка загрузки статистики:', err);
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Не удалось загрузить статистику');
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [period]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

  const maxActivity = activity.length > 0
    ? Math.max(...activity.map(a => a.approved + a.rejected + a.requestChanges))
    : 0;

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Статистика модератора</Title>
          <Select
            label="Период"
            value={period}
            onChange={(value) => setPeriod((value as StatsPeriod) || 'week')}
            data={[
              { value: 'today', label: 'Сегодня' },
              { value: 'week', label: 'Последние 7 дней' },
              { value: 'month', label: 'Последние 30 дней' },
            ]}
            style={{ minWidth: 200 }}
          />
        </Group>

        {summary && (
          <>
            {/* Карточки с метриками */}
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Всего проверено</Text>
                    <Text fw={700} size="xl">{summary.totalReviewed}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Сегодня</Text>
                    <Text fw={700} size="xl">{summary.totalReviewedToday}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">За неделю</Text>
                    <Text fw={700} size="xl">{summary.totalReviewedThisWeek}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">За месяц</Text>
                    <Text fw={700} size="xl">{summary.totalReviewedThisMonth}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Процент одобренных</Text>
                    <Text fw={700} size="xl">{summary.approvedPercentage.toFixed(1)}%</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Процент отклоненных</Text>
                    <Text fw={700} size="xl">{summary.rejectedPercentage.toFixed(1)}%</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">На доработку</Text>
                    <Text fw={700} size="xl">{summary.requestChangesPercentage.toFixed(1)}%</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Среднее время проверки</Text>
                    <Text fw={700} size="xl">{formatTime(summary.averageReviewTime)}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* График активности */}
            {activity.length > 0 && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={3} mb="md">График активности по дням</Title>
                <Stack gap="md">
                  {activity.map((item) => {
                    const total = item.approved + item.rejected + item.requestChanges;
                    return (
                      <div key={item.date}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>
                            {new Date(item.date).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </Text>
                          <Text size="sm" c="dimmed">{total} объявлений</Text>
                        </Group>
                        <Progress
                          value={maxActivity > 0 ? (total / maxActivity) * 100 : 0}
                          size="xl"
                          radius="xl"
                          color="blue"
                        />
                        <Group gap="xs" mt="xs">
                          <Text size="xs" c="green">Одобрено: {item.approved}</Text>
                          <Text size="xs" c="red">Отклонено: {item.rejected}</Text>
                          <Text size="xs" c="yellow">На доработку: {item.requestChanges}</Text>
                        </Group>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
            )}

            {/* диаграмма решений */}
            {decisions && (
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">Распределение решений</Title>
                    <Group justify="center">
                      <RingProgress
                        size={200}
                        thickness={20}
                        sections={[
                          {
                            value: decisions.approved,
                            color: 'green',
                            tooltip: `Одобрено: ${decisions.approved}%`,
                          },
                          {
                            value: decisions.rejected,
                            color: 'red',
                            tooltip: `Отклонено: ${decisions.rejected}%`,
                          },
                          {
                            value: decisions.requestChanges,
                            color: 'yellow',
                            tooltip: `На доработку: ${decisions.requestChanges}%`,
                          },
                        ]}
                      />
                    </Group>
                    <Stack gap="xs" mt="md">
                      <Group>
                        <div style={{ width: 12, height: 12, backgroundColor: 'green', borderRadius: 2 }} />
                        <Text size="sm">Одобрено: {decisions.approved}%</Text>
                      </Group>
                      <Group>
                        <div style={{ width: 12, height: 12, backgroundColor: 'red', borderRadius: 2 }} />
                        <Text size="sm">Отклонено: {decisions.rejected}%</Text>
                      </Group>
                      <Group>
                        <div style={{ width: 12, height: 12, backgroundColor: 'yellow', borderRadius: 2 }} />
                        <Text size="sm">На доработку: {decisions.requestChanges}%</Text>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>

                {/* График по категориям */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">Распределение по категориям</Title>
                    <Stack gap="md">
                      {Object.entries(categories).map(([category, count]) => {
                        const maxCount = Math.max(...Object.values(categories));
                        return (
                          <div key={category}>
                            <Group justify="space-between" mb="xs">
                              <Text size="sm" fw={500}>{category}</Text>
                              <Text size="sm" c="dimmed">{count}</Text>
                            </Group>
                            <Progress
                              value={maxCount > 0 ? (count / maxCount) * 100 : 0}
                              size="md"
                              radius="xl"
                              color="blue"
                            />
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

