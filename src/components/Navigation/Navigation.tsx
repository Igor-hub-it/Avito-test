import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@mantine/core';
import { IconList, IconChartBar } from '@tabler/icons-react';
import classes from './Navigation.module.css';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className={classes.nav}>
      <Button
        component={NavLink}
        to="/list"
        variant={location.pathname === '/list' || location.pathname.startsWith('/item') ? 'filled' : 'subtle'}
        leftSection={<IconList size={20} />}
        className={classes.link}
      >
        Список объявлений
      </Button>
      <Button
        component={NavLink}
        to="/stats"
        variant={location.pathname === '/stats' ? 'filled' : 'subtle'}
        leftSection={<IconChartBar size={20} />}
        className={classes.link}
      >
        Статистика
      </Button>
    </nav>
  );
}

