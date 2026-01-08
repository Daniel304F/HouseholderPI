import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";

function getUserDAO(req: Request): GenericDAO<User> {
  return req.app.locals["userDAO"] as GenericDAO<User>;
}

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const users = await userDAO.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const { id } = req.params;

    const user = await userDAO.findOne({ id } as any);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    // to-do: validation
    const newUser = await userDAO.create(req.body);

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const { id } = req.params;

    const updateData = { ...req.body, id };

    const success = await userDAO.update(updateData);

    if (!success) {
      res.status(404).json({ message: "User not found or not updated" });
      return;
    }

    const updatedUser = await userDAO.findOne({ id } as any);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const { id } = req.params;

    const success = await userDAO.delete(id!);

    if (!success) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};
