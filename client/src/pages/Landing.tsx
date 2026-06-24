import { useNavigate } from 'react-router-dom';

/**
 * 首页（Landing Page）
 *
 * Hero 区域 + 功能亮点 4 列卡片 + Footer。
 * CTA 按钮跳转到项目看板页面。
 */

/** 功能亮点数据 */
const features = [
  {
    icon: '📝',
    title: '智能报价单',
    description: 'AI 自动生成专业报价，告别手动计算，让报价更高效更准确。',
  },
  {
    icon: '📄',
    title: '标准合同',
    description: '4 种行业模板一键生成，变量自动填充，合同规范有保障。',
  },
  {
    icon: '💰',
    title: '收款追踪',
    description: '实时追踪付款状态，逾期自动提醒，资金流一目了然。',
  },
  {
    icon: '📊',
    title: '项目管理',
    description: '拖拽看板全流程掌控，从草稿到完成，项目进度清晰可见。',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero 区域 */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] px-4">
        <div className="text-center max-w-3xl mx-auto py-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            自由职业者的专业工具箱
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-10 leading-relaxed">
            智能报价 → 标准合同 → 在线收款，全流程一体化
          </p>
          <button
            onClick={handleCtaClick}
            className="px-8 py-3.5 bg-white text-[#2563EB] font-semibold rounded-lg text-base hover:bg-gray-50 transition-colors shadow-lg cursor-pointer"
          >
            免费开始使用
          </button>
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="bg-bg py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-text text-center mb-12">
            为什么选择我们
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-4xl block mb-4 select-none">
                  {feature.icon}
                </span>
                <h3 className="text-base font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-6 text-center">
        <p className="text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} 自由职工具箱. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
