import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();


// both of these lines are equivalent
// router.post("/register", registerUser);
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverPicture", maxCount: 1 }
    ]),
    registerUser
);

export default router;