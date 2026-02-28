import { Router } from "express";
import { PrismaClient, Platform } from "@prisma/client";
import { authenticateUser } from "../middleware/auth.js";
import { getFollowerCount } from "../services/scraper.js";

const router = Router();
const prisma = new PrismaClient();

// Check follower count (without saving)
router.get("/check-followers", authenticateUser, async (req: any, res: any) => {
    const { platform, handle } = req.query;

    if (!platform || !handle) {
        return res.status(400).json({ error: "Platform and handle are required" });
    }

    try {
        const followers = await getFollowerCount(platform as string, handle as string);
        res.json({ followers });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch followers" });
    }
});

// Get current user profile with social accounts
router.get("/", authenticateUser, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                accounts: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Fetch profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Link or update a social account
router.post("/social-account", authenticateUser, async (req: any, res) => {
    const { platform, handle, followers } = req.body;

    if (!platform || !handle) {
        return res.status(400).json({ error: "Platform and handle are required" });
    }

    try {
        // Find existing record
        const existing = await prisma.socialAccount.findFirst({
            where: { userId: req.user.id, platform: platform as Platform }
        });

        let account;
        if (existing) {
            account = await prisma.socialAccount.update({
                where: { id: existing.id },
                data: {
                    handle,
                    followers: parseInt(followers) || 0,
                    isActive: true,
                },
            });
        } else {
            account = await prisma.socialAccount.create({
                data: {
                    userId: req.user.id,
                    platform: platform as Platform,
                    handle,
                    followers: parseInt(followers) || 0,
                    isActive: true,
                },
            });
        }

        res.json({ account });
    } catch (error) {
        console.error("Upsert social account error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
