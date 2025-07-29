
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MessageNotificationsProvider } from './hooks/useMessageNotifications.tsx'

createRoot(document.getElementById("root")!).render(
  <MessageNotificationsProvider>
    <App />
  </MessageNotificationsProvider>
);
