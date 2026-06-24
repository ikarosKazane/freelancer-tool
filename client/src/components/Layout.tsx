import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

/**
 * 全局布局组件
 *
 * 提供侧边栏（Logo + 导航 + 设置）、顶部栏（标题 + 用户信息）和内容区。
 * 移动端侧边栏可折叠，桌面端固定显示。
 */

/** 导航项配置 */
const navItems: { to: string; label: string; icon: string }[] = [
  { to: '/dashboard', label: '仪表盘', icon: '🏠' },
  { to: '/projects', label: '项目看板', icon: '📋' },
  { to: '/templates', label: '合同模板', icon: '📄' },
  { to: '/profile', label: '个人中心', icon: '👤' },
];

/** 根据当前路由路径生成页面标题 */
function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return '仪表盘';
  if (pathname === '/projects/new') return '新建项目';
  if (/^\/projects\/\d+$/.test(pathname)) return '项目详情';
  if (/^\/projects\/\d+\/quotation$/.test(pathname)) return '报价生成';
  if (/^\/projects\/\d+\/contract$/.test(pathname)) return '合同生成';
  if (/^\/projects\/\d+\/payment$/.test(pathname)) return '收款管理';
  if (pathname === '/projects') return '项目看板';
  if (pathname === '/templates') return '合同模板';
  if (pathname === '/profile') return '个人中心';
  if (pathname === '/settings') return '设置';
  return '';
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, fetchUser } = useUserStore();

  /** 首次加载时获取用户信息 */
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 路由切换时在移动端自动关闭侧边栏 */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-bg">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-60 bg-surface border-r border-border
          flex flex-col transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-14 border-b border-border flex-shrink-0">
          <span className="text-2xl select-none">⚡</span>
          <span className="text-base font-bold text-primary">自由职</span>
        </div>

        {/* 导航链接 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text'
                }`
              }
            >
              <span className="text-base select-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 底部：设置 */}
        <div className="border-t border-border px-3 py-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text'
              }`
            }
          >
            <span className="text-base select-none">⚙️</span>
            <span>设置</span>
          </NavLink>
        </div>
      </aside>

      {/* 右侧区域 */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 顶部栏 */}
        <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-surface border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* 移动端 Hamburger 按钮 */}
            <button
              className="md:hidden p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-text">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary hidden sm:block">
              {user?.name || '加载中...'}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold select-none">
              {user?.name?.charAt(0) || '?'}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
