import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: 'Helvetica',
    allVariants: {
      color: '#222222',
    },
  },
  palette: {
    primary: {
      main: '#222222',
      light: '#3C286E',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#464655',
    },
  },
});
