import Notification from '../models/Notification.js';

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const createNotifications = async (data, session = null) => {
  return await Notification.insertMany(data, { session });
};

export const findNotifications = async (filter = {}) => {
  return await Notification.find(filter)
    .populate('matiere')
    .populate('mouvement')
    .sort({ createdAt: -1 });
};

export const findUnreadNotifications = async () => {
  return await Notification.find({ lu: false })
    .populate('matiere')
    .populate('mouvement')
    .sort({ createdAt: -1 });
};

export const findById = async (id) => {
  return await Notification.findById(id)
    .populate('matiere')
    .populate('mouvement');
};

export const markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { lu: true },
    { new: true, runValidators: true }
  )
    .populate('matiere')
    .populate('mouvement');
};

export const markAllAsRead = async () => {
  return await Notification.updateMany({ lu: false }, { lu: true });
};

export const countUnread = async () => {
  return await Notification.countDocuments({ lu: false });
};

