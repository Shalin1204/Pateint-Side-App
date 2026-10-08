/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MobileAppShell } from './components/layout/MobileAppShell';
import { ToastContainer } from './components/common/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <ToastContainer />
          <MobileAppShell />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
