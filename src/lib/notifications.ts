import connectToDatabase from '@/lib/db';
import Notification, { NotificationType } from '@/models/Notification';
import mongoose from 'mongoose';

export interface CreateNotificationParams {
  userId?: string | mongoose.Types.ObjectId;
  forAdmin?: boolean;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Creates and saves a notification for a user or admin.
 * Silently catches errors so main transactional workflows aren't blocked if notification creation fails.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectToDatabase();
    const doc: any = {
      title: params.title,
      message: params.message,
      type: params.type || 'system',
      link: params.link,
      read: false,
      forAdmin: Boolean(params.forAdmin),
    };

    if (params.userId) {
      doc.userId = new mongoose.Types.ObjectId(params.userId.toString());
    }

    const notification = await Notification.create(doc);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Helper to dispatch an admin-targeted notification
 */
export async function createAdminNotification(params: Omit<CreateNotificationParams, 'forAdmin'>) {
  return createNotification({
    ...params,
    forAdmin: true,
  });
}
