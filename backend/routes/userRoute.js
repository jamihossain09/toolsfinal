import express from "express";
import { allUser, forgotPassword, login, logout, register, reVerify, verify } from "../controller/userControllers.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";


const router = express.Router();
router.post("/register", register);
router.post("/verify",verify)
router.post("/reverify",reVerify)
router.post("login",login)
router.post("/logout", isAuthenticated,logout)
router.post("/forget-password",isAuthenticated, forgotPassword)
router.get("/all-user",isAuthenticated, isAdmin allUser)
export default router;
