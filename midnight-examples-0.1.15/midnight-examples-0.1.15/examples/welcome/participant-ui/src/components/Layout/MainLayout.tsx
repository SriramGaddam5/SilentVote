import { type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAppContext } from '../../hooks';
import { Header } from './Header';
import { BackdropLoader } from '../Loader';

export const MainLayout = (): ReactElement => {
  const { isLoading, loadingTitle } = useAppContext();
  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Header />
      {isLoading && <BackdropLoader title={loadingTitle} />}
      <Box sx={{ px: 10, position: 'relative', height: '100%' }}>
        <img
          src="/logo-render.png"
          alt="logo-image"
          height={607}
          style={{ position: 'absolute', zIndex: 1, left: '2vw', top: '5vh' }}
        />
        <Box
          sx={{
            zIndex: 999,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            py: '10vh',
            px: '15vw',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
