import { type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAppContext } from '../../hooks';
import { Header } from './Header';
import { BackdropLoader } from '../Loader';

export const MainLayout = (): ReactElement => {
  const { isLoading } = useAppContext();

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Header />
      {isLoading && <BackdropLoader />}
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
            height: '100%',
            py: '10vh',
            px: '5vw',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
