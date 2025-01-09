import { useRoutes } from 'react-router-dom';
import Login from '../Login';
import { Dashboard } from '../Dashboard';

function Router() {
  const commonRoutes = [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '*',
      element: <Dashboard />,
    },
  ];

  return useRoutes(commonRoutes);
}

export default Router;
