import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';

function Root() {
  const { user } = useApp();
  return user ? <MainLayout /> : <AuthPage />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
