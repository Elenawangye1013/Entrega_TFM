import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './pages/styles/theme'; 

const container = document.getElementById('root');


const root = ReactDOM.createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
