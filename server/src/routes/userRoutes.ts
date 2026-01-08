import { Router } from "express";
import * as userController from "../controllers/userController.js";

const router = Router();

router.get("/", userController.getAllUsers);

router.post("/", userController.createUser);

router.get("/:id", userController.getUserById);

router.patch("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

export default router;
