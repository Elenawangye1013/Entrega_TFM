import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#EA5141', // Rojo 
    },
    secondary: {
      main: '#D4A373', 
    },
    background: {
      default: '#FEFAE0', // Beige 
    },
    text: {
      primary: '#2D2D2D', 
      secondary: '#EA5141', 
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    
  },
});

export default theme;
