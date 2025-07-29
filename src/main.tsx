
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MessageNotificationsProvider } from './hooks/useMessageNotifications.tsx'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MessageNotificationsProvider>
      <App />
    </MessageNotificationsProvider>
  </React.StrictMode>
);
