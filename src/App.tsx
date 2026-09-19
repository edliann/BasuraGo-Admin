import AppRoutes from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext/AuthContext';
import Loading from './pages/Loading/Loading';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return <AppRoutes />;
}

export default App;

