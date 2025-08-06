
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Layout from '@/components/Layout';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Home = lazy(() => import('./pages/Home'));
const Nyrvalos = lazy(() => import('./pages/Nyrvalos'));
const Community = lazy(() => import('./pages/Community'));
const Forum = lazy(() => import('./pages/Forum'));
const Towns = lazy(() => import('./pages/Towns'));
const Town = lazy(() => import('./pages/Town'));
const Shop = lazy(() => import('./pages/Shop'));
const Company = lazy(() => import('./pages/Company'));
const Economy = lazy(() => import('./pages/Economy'));
const Map = lazy(() => import('./pages/Map'));
const Wiki = lazy(() => import('./pages/Wiki'));
const OptimizedWiki = lazy(() => import('./pages/OptimizedWiki'));
const WikiDebug = lazy(() => import('./pages/WikiDebug'));
const SupabaseWikiTest = lazy(() => import('./components/wiki/SupabaseWikiTest'));
const SimpleWikiTest = lazy(() => import('./components/wiki/SimpleWikiTest'));
const Store = lazy(() => import('./pages/Store'));
const Rules = lazy(() => import('./pages/Rules'));
const Contact = lazy(() => import('./pages/Contact'));
const Messages = lazy(() => import('./pages/Messages'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const LoginDebug = lazy(() => import('./pages/LoginDebug'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login-debug" element={<LoginDebug />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/home" element={<Layout><Home /></Layout>} />
                <Route path="/nyrvalos" element={<Nyrvalos />} />
                <Route path="/community" element={<Layout><Community /></Layout>} />
                <Route path="/forum" element={<Layout><Forum /></Layout>} />
                <Route path="/forum/category/:categoryId" element={<Layout><Forum /></Layout>} />
                <Route path="/forum/post/:postId" element={<Layout><Forum /></Layout>} />
                <Route path="/towns" element={<Layout><Towns /></Layout>} />
                <Route path="/towns/nations" element={<Layout><Towns defaultTab="nations" /></Layout>} />
                <Route path="/towns/towns" element={<Layout><Towns defaultTab="nations" /></Layout>} />
                <Route path="/towns/groups" element={<Layout><Towns defaultTab="markets" /></Layout>} />
                <Route path="/towns/businesses" element={<Layout><Towns defaultTab="markets" /></Layout>} />
                <Route path="/towns/shops" element={<Layout><Towns defaultTab="markets" /></Layout>} />
                <Route path="/town/:townName" element={<Layout><Town /></Layout>} />
                <Route path="/shop/:shopId" element={<Layout><Shop /></Layout>} />
                <Route path="/company/:slug" element={<Layout><Company /></Layout>} />
                <Route path="/economy" element={<Layout><Economy /></Layout>} />
                <Route path="/map" element={<Layout><Map /></Layout>} />
                <Route path="/map/:mapDate" element={<Layout><Map /></Layout>} />
                <Route path="/wiki" element={<Layout><Wiki /></Layout>} />
                <Route path="/wiki/:slug" element={<Layout><Wiki /></Layout>} />
                <Route path="/optimized-wiki" element={<Layout><OptimizedWiki /></Layout>} />
                <Route path="/wiki-debug" element={<Layout><WikiDebug /></Layout>} />
                <Route path="/wiki-test" element={<Layout><SupabaseWikiTest /></Layout>} />
                <Route path="/simple-wiki-test" element={<Layout><SimpleWikiTest /></Layout>} />
                <Route path="/store" element={<Layout><Store /></Layout>} />
                <Route path="/rules" element={<Layout><Rules /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/messages" element={<Layout><Messages /></Layout>} />
                <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
                <Route path="/admin" element={<Layout><Admin /></Layout>} />
                <Route path="/404" element={<Layout><NotFound /></Layout>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
