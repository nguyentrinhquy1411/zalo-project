import express from "express";
import {
  sendRequest,
  getFriends,
  acceptRequest,
  rejectRequest,
  getFriendRequests,
  checkFriendshipStatus,
  getFriendStatus,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/request", protectRoute, sendRequest);
router.post("/accept", protectRoute, acceptRequest);
router.post("/reject", protectRoute, rejectRequest);
router.post("/check-friendship", protectRoute, checkFriendshipStatus);
router.get("/list", protectRoute, getFriends);
router.get("/requests/:userId", protectRoute, getFriendRequests);
router.get("/status/:userId", protectRoute, getFriendStatus);

export default router;
