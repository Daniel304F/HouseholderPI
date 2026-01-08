import { Entity } from "./entity.js";

export interface User extends Entity {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface UserReponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
