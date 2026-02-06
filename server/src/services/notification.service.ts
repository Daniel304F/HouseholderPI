import webpush from "web-push";
import { GenericDAO } from "../models/generic.dao.js";
import { User, PushSubscriptionData } from "../models/user.js";
import { NotFoundError } from "./errors.js";
import config from "../config/config.js";

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

const GONE_STATUS_CODE = 410;

export class NotificationService {
  constructor(private userDAO: GenericDAO<User>) {
    if (config.vapid.publicKey && config.vapid.privateKey) {
      webpush.setVapidDetails(
        config.vapid.subject,
        config.vapid.publicKey,
        config.vapid.privateKey,
      );
    }
  }

  async addSubscription(
    userId: string,
    subscription: PushSubscriptionData,
  ): Promise<void> {
    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }

    const existing = user.pushSubscriptions ?? [];
    const isDuplicate = existing.some(
      (sub) => sub.endpoint === subscription.endpoint,
    );

    if (isDuplicate) {
      return;
    }

    await this.userDAO.update({
      id: userId,
      pushSubscriptions: [...existing, subscription],
    } as Partial<User>);
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) return;

    const filtered = (user.pushSubscriptions ?? []).filter(
      (sub) => sub.endpoint !== endpoint,
    );

    await this.userDAO.update({
      id: userId,
      pushSubscriptions: filtered,
    } as Partial<User>);
  }

  async sendNotificationToUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user || !user.pushSubscriptions?.length) return;

    const staleEndpoints: string[] = [];
    const payloadString = JSON.stringify(payload);

    const results = user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payloadString,
        );
      } catch (error: unknown) {
        const statusCode =
          error instanceof webpush.WebPushError ? error.statusCode : null;
        if (statusCode === GONE_STATUS_CODE) {
          staleEndpoints.push(sub.endpoint);
        } else {
          console.error(
            `Push notification failed for endpoint ${sub.endpoint}:`,
            error,
          );
        }
      }
    });

    await Promise.allSettled(results);

    // Abgelaufene Subscriptions entfernen
    if (staleEndpoints.length > 0) {
      const cleaned = user.pushSubscriptions.filter(
        (sub) => !staleEndpoints.includes(sub.endpoint),
      );
      await this.userDAO.update({
        id: userId,
        pushSubscriptions: cleaned,
      } as Partial<User>);
    }
  }
}
