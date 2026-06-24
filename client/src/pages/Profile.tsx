import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

/**
 * 个人中心页面
 *
 * 编辑个人信息（姓名、邮箱、手机号、职业、头像）和品牌信息（品牌名称、Logo、地址），
 * 保存后通过 userStore.updateUser 更新到后端。
 */

/** 职业选项配置（value → 中文标签） */
const professionOptions: { value: User['profession']; label: string }[] = [
  { value: 'designer', label: '设计师' },
  { value: 'developer', label: '开发者' },
  { value: 'writer', label: '撰稿人' },
  { value: 'consultant', label: '咨询师' },
  { value: 'photographer', label: '摄影师' },
];

export default function Profile() {
  const { user, loading, fetchUser, updateUser } = useUserStore();

  /** 表单状态 */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: 'designer' as User['profession'],
    avatarUrl: '',
    brandName: '',
    brandLogoUrl: '',
    brandAddress: '',
  });

  /** 表单验证错误 */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** 保存成功提示 */
  const [saveSuccess, setSaveSuccess] = useState(false);

  /** 保存中状态 */
  const [saving, setSaving] = useState(false);

  /** 从 user store 同步数据到表单 */
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profession: user.profession || 'designer',
        avatarUrl: user.avatarUrl || '',
        brandName: user.brandName || '',
        brandLogoUrl: user.brandLogoUrl || '',
        brandAddress: user.brandAddress || '',
      });
    }
  }, [user]);

  /** 更新表单字段 */
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    // 清除保存成功提示
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  /** 表单验证 */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** 保存 */
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profession: formData.profession,
        avatarUrl: formData.avatarUrl.trim(),
        brandName: formData.brandName.trim(),
        brandLogoUrl: formData.brandLogoUrl.trim(),
        brandAddress: formData.brandAddress.trim(),
      });
      setSaveSuccess(true);
      // 3 秒后自动隐藏成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // updateUser 内部已处理错误状态
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-text">个人中心</h2>
        <p className="text-sm text-text-secondary mt-1">
          管理你的个人信息和品牌设置
        </p>
      </div>

      {/* 保存成功提示 */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="select-none">✓</span>
          <span>保存成功</span>
        </div>
      )}

      {/* 个人信息卡片 */}
      <div className="bg-surface rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">个人信息</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              姓名 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入姓名"
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-colors
                ${errors.name ? 'border-danger' : 'border-border'}
              `}
            />
            {errors.name && (
              <p className="text-xs text-danger mt-1">{errors.name}</p>
            )}
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* 手机号 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">手机号</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* 职业 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">职业</label>
            <select
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              {professionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 头像 URL */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">头像 URL</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleChange('avatarUrl', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {formData.avatarUrl && (
              <div className="mt-2">
                <img
                  src={formData.avatarUrl}
                  alt="头像预览"
                  className="w-12 h-12 rounded-full object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 品牌信息卡片 */}
      <div className="bg-surface rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">品牌信息</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            用于报价单和合同的抬头显示
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* 品牌名称 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">品牌名称</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => handleChange('brandName', e.target.value)}
              placeholder="你的品牌或工作室名称"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Logo URL</label>
            <input
              type="url"
              value={formData.brandLogoUrl}
              onChange={(e) => handleChange('brandLogoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {formData.brandLogoUrl && (
              <div className="mt-2">
                <img
                  src={formData.brandLogoUrl}
                  alt="Logo 预览"
                  className="h-10 object-contain border border-border rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* 品牌地址 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">品牌地址</label>
            <input
              type="text"
              value={formData.brandAddress}
              onChange={(e) => handleChange('brandAddress', e.target.value)}
              placeholder="省/市/区 详细地址"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="
            px-6 py-2.5 rounded-lg text-sm font-medium text-white
            bg-primary hover:bg-primary-dark
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors cursor-pointer
          "
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
