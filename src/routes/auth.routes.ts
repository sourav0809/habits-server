import express from "express";

import authController from "../controller/auth.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import { loginSchema, registerSchema } from "@/validations/auth.validation";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;