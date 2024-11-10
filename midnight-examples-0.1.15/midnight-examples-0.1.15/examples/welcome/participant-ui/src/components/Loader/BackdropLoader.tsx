import { type ReactElement } from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import { MISC } from '../../locale';

interface BackdropLoaderProps {
  title?: string;
}

export const BackdropLoader = ({ title }: BackdropLoaderProps): ReactElement => (
  <Backdrop sx={{ color: 'white', zIndex: 9999 }} open>
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress data-testid="backdrop-loader-spinner" color="inherit" />
      <Typography data-testid="backdrop-loader-title" sx={{ mt: 2 }} color="inherit" variant="h4">
        {title ?? MISC.pleaseWait}
      </Typography>
    </Box>
  </Backdrop>
);
