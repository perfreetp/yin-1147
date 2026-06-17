import Taro from '@tarojs/taro';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, 'MM-DD HH:mm');
};

export const getDaysUntilExpire = (expireDate: string): number => {
  const now = new Date().getTime();
  const expire = new Date(expireDate).getTime();
  return Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
};

export const showToast = (title: string, icon: 'success' | 'error' | 'none' | 'loading' = 'none') => {
  Taro.showToast({ title, icon, duration: 2000 });
};

export const showLoading = (title: string = '加载中...') => {
  Taro.showLoading({ title, mask: true });
};

export const hideLoading = () => {
  Taro.hideLoading();
};

export const copyToClipboard = (text: string) => {
  Taro.setClipboardData({
    data: text,
    success: () => showToast('已复制', 'success')
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#FFAB00',
    processing: '#00B8D9',
    received: '#00B8D9',
    cleaning: '#00B8D9',
    disinfecting: '#00B8D9',
    sterilizing: '#00B8D9',
    packaging: '#00B8D9',
    shipping: '#00B8D9',
    delivered: '#00B8D9',
    completed: '#36B37E',
    valid: '#36B37E',
    used: '#86909C',
    expired: '#FF5630',
    confirmed: '#36B37E',
    paid: '#36B37E',
    exception: '#FF5630'
  };
  return colorMap[status] || '#9CA3AF';
};

export const getStatusBgColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#FFF7E6',
    processing: '#E6F7FB',
    received: '#E6F7FB',
    cleaning: '#E6F7FB',
    disinfecting: '#E6F7FB',
    sterilizing: '#E6F7FB',
    packaging: '#E6F7FB',
    shipping: '#E6F7FB',
    delivered: '#E6F7FB',
    completed: '#E8F8F0',
    valid: '#E8F8F0',
    used: '#F2F3F5',
    expired: '#FFECE8',
    confirmed: '#E8F8F0',
    paid: '#E8F8F0',
    exception: '#FFECE8'
  };
  return colorMap[status] || '#F2F3F5';
};
