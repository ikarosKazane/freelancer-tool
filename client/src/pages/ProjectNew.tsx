import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import type { CreateProjectRequest } from '@/types';

/**
 * 新建项目页面
 *
 * 表单包含项目名称、客户名称、联系方式、描述和预算。
 * 表单验证后提交到 projectStore 并跳转回看板。
 */

/** 表单错误信息 */
interface FormErrors {
  name: string;
  description: string;
  budget: string;
}

export default function ProjectNew() {
  const navigate = useNavigate();
  const { createProject, loading } = useProjectStore();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    description: '',
    budget: '',
  });

  /** 表单验证 */
  const validate = (): boolean => {
    const newErrors: FormErrors = { name: '', description: '', budget: '' };
    let valid = true;

    if (!name.trim()) {
      newErrors.name = '项目名称不能为空';
      valid = false;
    }
    if (!description.trim()) {
      newErrors.description = '项目描述不能为空';
      valid = false;
    }
    if (budget < 0) {
      newErrors.budget = '预算不能为负数';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /** 提交表单 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateProjectRequest = {
      name: name.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      description: description.trim(),
      budget,
    };

    try {
      await createProject(data);
      navigate('/projects');
    } catch {
      // Store 已处理错误提示
    }
  };

  /** 取消 */
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text mb-6">新建项目</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 项目名称 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              项目名称 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：企业官网设计"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name}</p>
            )}
          </div>

          {/* 客户名称 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              客户名称
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="填写客户公司或个人名称"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* 客户联系方式 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              客户联系方式
            </label>
            <input
              type="text"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="手机号、邮箱或微信"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* 项目描述 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              项目描述 <span className="text-danger">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述项目需求和范围..."
              rows={4}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-danger">{errors.description}</p>
            )}
          </div>

          {/* 预算 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              预算（¥）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                ¥
              </span>
              <input
                type="number"
                min={0}
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {errors.budget && (
              <p className="mt-1 text-xs text-danger">{errors.budget}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? '创建中...' : '创建项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
