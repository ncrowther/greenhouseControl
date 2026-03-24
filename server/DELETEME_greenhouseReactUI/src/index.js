import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import IndustrialController from './IndustrialController.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <IndustrialController />
      </QueryClientProvider>

    </React.StrictMode>
  )

