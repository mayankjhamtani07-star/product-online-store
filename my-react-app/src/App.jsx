import './App.css';
                                                                                                                        import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { AdminProvider } from './admin/context/adminContext';
import AppRouter from './routes/router';
import AdminRouter from './admin/routes/route';

const RootRouter = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin")
    ? <AdminProvider><AdminRouter /></AdminProvider>
    : <AuthProvider><AppRouter /></AuthProvider>;
};

function App() {
  return (
    <BrowserRouter>
      <RootRouter />
    </BrowserRouter>
  );
}

export default App;
