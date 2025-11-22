import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation/Navigation';
import { AdvertisementsPage } from '@/pages/AdvertisementsPage/AdvertisementsPage';
import { AdvertisementPage } from '@/pages/AdvertisementPage/AdvertisementPage';
import { OrdersPage } from '@/pages/OrdersPage/OrdersPage';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import classes from './App.module.css';

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <div className={classes.app}>
          <Navigation />
          <main className={classes.main}>
            <Routes>
              <Route path="/" element={<Navigate to="/advertisements" replace />} />
              <Route path="/advertisements" element={<AdvertisementsPage />} />
              <Route path="/advertisements/:id" element={<AdvertisementPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="*" element={<Navigate to="/advertisements" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;


