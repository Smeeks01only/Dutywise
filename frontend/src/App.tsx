import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen font-sans text-neutral-900 selection:bg-primary-200 selection:text-primary-900">
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
