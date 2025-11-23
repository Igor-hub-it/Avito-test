import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@mantine/core';
import { IconShoppingBag, IconList } from '@tabler/icons-react';
import classes from './Navigation.module.css';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className={classes.nav}>
      <Button
        component={NavLink}
        to="/advertisements"
        variant={location.pathname.startsWith('/advertisements') ? 'filled' : 'subtle'}
        leftSection={<IconList size={20} />}
        className={classes.link}
      >
        Объявления
      </Button>
      <Button
        component={NavLink}
        to="/orders"
        variant={location.pathname.startsWith('/orders') ? 'filled' : 'subtle'}
        leftSection={<IconShoppingBag size={20} />}
        className={classes.link}
      >
        Заказы
      </Button>
    </nav>
  );
}

