import { Entity } from "./entity.js";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface User extends Entity {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  pushSubscriptions?: PushSubscriptionData[];
}

export interface UserReponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
