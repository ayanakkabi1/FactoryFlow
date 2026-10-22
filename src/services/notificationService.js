import * as notificationRepository from '../repositories/notificationRepository.js';

export const getAllNotificationsService = async (filter = {}) => {
  return await notificationRepository.findNotifications(filter);
};

export const getUnreadNotificationsService = async () => {
  return await notificationRepository.findUnreadNotifications();
};

export const markNotificationAsReadService = async (id) => {
  const notification = await notificationRepository.markAsRead(id);
  if (!notification) {
    const error = new Error('Notification introuvable');
    error.statusCode = 404;
    throw error;
  }
  return notification;
};

export const markAllNotificationsAsReadService = async () => {
  return await notificationRepository.markAllAsRead();
};

export const countUnreadNotificationsService = async () => {
  return await notificationRepository.countUnread();
};

