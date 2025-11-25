import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation/Navigation';
import { AdvertisementsPage } from '@/pages/AdvertisementsPage/AdvertisementsPage';
import { AdvertisementPage } from '@/pages/AdvertisementPage/AdvertisementPage';
import { StatsPage } from '@/pages/StatsPage/StatsPage';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
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
              <Route path="/" element={<Navigate to="/list" replace />} />
              <Route path="/list" element={<AdvertisementsPage />} />
              <Route path="/item/:id" element={<AdvertisementPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/list" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;


