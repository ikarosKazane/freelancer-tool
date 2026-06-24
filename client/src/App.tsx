import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import ProjectBoard from '@/pages/ProjectBoard';
import ProjectNew from '@/pages/ProjectNew';
import ProjectDetail from '@/pages/ProjectDetail';
import QuotationPage from '@/pages/QuotationPage';
import ContractPage from '@/pages/ContractPage';
import PaymentPage from '@/pages/PaymentPage';
import Dashboard from '@/pages/Dashboard';
import TemplateLibrary from '@/pages/TemplateLibrary';
import Profile from '@/pages/Profile';

/**
 * 路由配置 + 全局布局
 *
 * 使用 React Router v6 Data Router (createBrowserRouter)。
 * T05 阶段：10 个页面已实现，仅 Settings 保留占位。
 */

// ===== 占位页面组件 =====

function SettingsPlaceholder() {
  return <div className="p-8 text-center text-2xl text-gray-400">设置（待实现）</div>;
}

// ===== 路由定义 =====

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/projects',
        element: <ProjectBoard />,
      },
      {
        path: '/projects/new',
        element: <ProjectNew />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetail />,
      },
      {
        path: '/projects/:id/quotation',
        element: <QuotationPage />,
      },
      {
        path: '/projects/:id/contract',
        element: <ContractPage />,
      },
      {
        path: '/projects/:id/payment',
        element: <PaymentPage />,
      },
      {
        path: '/templates',
        element: <TemplateLibrary />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/settings',
        element: <SettingsPlaceholder />,
      },
    ],
  },
]);

// ===== App 根组件 =====

export default function App() {
  return <RouterProvider router={router} />;
}
