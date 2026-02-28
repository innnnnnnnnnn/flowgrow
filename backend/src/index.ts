import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/profile', profileRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Telegram Auth Verification
function verifyTelegramWebAppData(initData: string): { isValid: boolean; userData?: any } {
    const BOT_TOKEN = process.env.BOT_TOKEN || '';
    if (!BOT_TOKEN) return { isValid: false };

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();

    let dataCheckString = '';
    for (const [key, value] of urlParams.entries()) {
        dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const _hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (_hash !== hash) {
        return { isValid: false };
    }

    const userString = urlParams.get('user');
    if (userString) {
        try {
            return { isValid: true, userData: JSON.parse(userString) };
        } catch (e) {
            return { isValid: false };
        }
    }

    return { isValid: false };
}

// Telegram Widget Auth Verification (for external browser login)
function verifyTelegramWidgetData(data: any): boolean {
    const BOT_TOKEN = process.env.BOT_TOKEN || '';
    if (!BOT_TOKEN || !data.hash) return false;

    const hash = data.hash;
    const dataCheckArr = [];
    for (const key in data) {
        if (key !== 'hash') {
            dataCheckArr.push(`${key}=${data[key]}`);
        }
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const _hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return _hash === hash;
}

app.post('/auth/telegram-widget', async (req, res) => {
    const data = req.body;
    const isValid = verifyTelegramWidgetData(data);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid authentication data' });
    }

    const telegramId = data.id.toString();
    const username = data.username || data.first_name;

    try {
        const user = await prisma.user.upsert({
            where: { telegramId },
            update: { username },
            create: { telegramId, username }
        });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Auth failed' });
    }
});

app.post('/auth/telegram', async (req, res) => {
    const { initData } = req.body;
    const { isValid, userData } = verifyTelegramWebAppData(initData);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid authentication data' });
    }

    const telegramId = userData.id.toString();
    const username = userData.username || userData.first_name;

    try {
        const user = await prisma.user.upsert({
            where: { telegramId },
            update: { username },
            create: { telegramId, username }
        });
        res.json({ user, userData });
    } catch (error) {
        res.status(500).json({ error: 'Auth failed' });
    }
});

// Users Routes
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({
        include: { accounts: true }
    });
    res.json(users);
});

app.post('/users', async (req, res) => {
    const { telegramId, username, role } = req.body;
    try {
        const user = await prisma.user.upsert({
            where: { telegramId },
            update: { username, role },
            create: { telegramId, username, role }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

// Orders Routes
app.post('/orders', async (req, res) => {
    const { creatorId, platform, budget, requirements } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                creatorId,
                platform,
                budget,
                requirements,
            }
        });
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create order' });
    }
});

// Tasks Matching (Simple MVP)
app.post('/tasks/match', async (req, res) => {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { tasks: true }
    });

    if (!order || order.status !== 'PENDING') {
        return res.status(400).json({ error: 'Order not eligible for matching' });
    }

    // Find an available promoter with the corresponding platform account
    const promoter = await prisma.user.findFirst({
        where: {
            role: 'PROMOTER',
            accounts: {
                some: {
                    platform: order.platform,
                    isActive: true
                }
            }
        },
        include: {
            accounts: {
                where: {
                    platform: order.platform,
                    isActive: true
                }
            }
        }
    });

    if (!promoter) {
        return res.status(404).json({ error: 'No matching promoter found' });
    }

    const account = promoter.accounts?.[0];
    if (!account) {
        return res.status(404).json({ error: 'No matching promoter found' });
    }

    const task = await prisma.task.create({
        data: {
            orderId: order.id,
            promoterId: promoter.id,
            socialAccountId: account.id,
            status: 'ASSIGNED'
        }
    });

    await prisma.order.update({
        where: { id: order.id },
        data: { status: 'MATCHED' }
    });

    res.json(task);
});

try {
    app.listen(port, () => {
        console.log(`FLOWGROW backend listening at http://localhost:${port}`);
    }).on('error', (err) => {
        console.error('Server failed to start:', err);
        process.exit(1);
    });
} catch (e) {
    console.error('Unhandled exception during startup:', e);
    process.exit(1);
}
