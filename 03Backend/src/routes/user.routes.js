import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();


// both of these lines are equivalent
// router.post("/register", registerUser);
router.route("/register").post(registerUser);

export default router;