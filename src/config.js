const publicConfig = window.YUYU_PUBLIC_CONFIG || {};

export const ENABLE_BACKEND_API = publicConfig.enableBackendApi ?? true;
export const API_BASE_URL = (publicConfig.apiBaseUrl || publicConfig.apiBaseURL || 'https://yuyu-backend-66fk.onrender.com').replace(/\/$/, '');
export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const CONTACT_CONFIG = {
  email: publicConfig.email || 'yuyuonlineshopping14@gmail.com',
  phone: publicConfig.phone || '+251944808865',
  tiktokHandle: publicConfig.tiktokHandle || '@yuyuonline.shoppi',
  instagramHandle: publicConfig.instagramHandle || 'yuyuonlineshopping',
  telegramHandle: publicConfig.telegramHandle || '@Yuyuonlineshopping',
  telegramUrl: publicConfig.telegramUrl || 'https://t.me/Yuyuonlineshopping',
  instagramUrl: publicConfig.instagramUrl || 'https://instagram.com/yuyuonlineshopping',
  tiktokUrl: publicConfig.tiktokUrl || 'https://www.tiktok.com/@yuyuonline.shoppi',
  whatsappUrl: publicConfig.whatsappUrl || 'https://wa.me/251944808865'
};
