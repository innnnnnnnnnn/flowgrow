import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticateUser = async (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const telegramId = req.headers['x-telegram-id'];

    if (!telegramId) {
        return res.status(401).json({ error: "Unauthorized: Missing Telegram ID" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { telegramId: telegramId as string },
        });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
