import express from "express";
import { login, register, reVerify, verify } from "../controller/userControllers.js";


const router = express.Router();
router.post("/register", register);
router.post("/verify",verify)
router.post("/reverify",reVerify)
router.post("login",login)
// router.post("logout")
export default router;
