import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
export async function getFollowerCount(platform: string, handle: string): Promise<number> {
    const cleanHandle = handle.replace("@", "").trim();

    try {
        switch (platform.toUpperCase()) {
            case "INSTAGRAM":
                return await fetchInstagramFollowers(cleanHandle);
            case "TIKTOK":
                return await fetchTikTokFollowers(cleanHandle);
            default:
                return 0;
        }
    } catch (error: any) {
        console.error(`Error fetching followers for ${platform} ${handle}:`, error?.message || error);
        return 0;
    }
}

async function fetchInstagramFollowers(handle: string): Promise<number> {
    try {
        const url = `https://www.instagram.com/${handle}/`;
        // Use curl as it's often less blocked by WAFs compared to node HTTP clients
        const cmd = `curl -sL -m 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "${url}"`;
        const { stdout } = await execAsync(cmd);

        // Pattern: "614M Followers" in meta tags
        const patterns = [
            /content=\"([\d,.]+)([KMB]?)\s+(Fans|Followers|粉絲)/i,
            /([\d,.]+)([KMB]?)\s+(Fans|Followers|粉絲)/i
        ];

        for (const pattern of patterns) {
            const match = stdout.match(pattern);
            if (match) {
                console.log(`Matched pattern for ${handle}: ${match[0]}`);
                return parseCount(match[1] + (match[2] || ""));
            }
        }

        return 0;
    } catch (e: any) {
        console.error(`Instagram fetch failed for ${handle}: ${e?.message}`);
        return 0;
    }
}

async function fetchTikTokFollowers(handle: string): Promise<number> {
    try {
        const url = `https://www.tiktok.com/@${handle}`;
        const cmd = `curl -sL -m 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "${url}"`;
        const { stdout } = await execAsync(cmd);

        // Pattern 1: JSON
        const jsonMatch = stdout.match(/\"followerCount\":(\d+)/);
        if (jsonMatch && jsonMatch[1]) {
            return parseInt(jsonMatch[1]);
        }

        // Pattern 2: Meta
        const metaMatch = stdout.match(/(\d+(?:\.\d+)?[KMB]?)\s+(Fans|Followers|粉絲)/i);
        if (metaMatch && metaMatch[1]) {
            return parseCount(metaMatch[1]);
        }

        return 0;
    } catch (e: any) {
        console.error(`TikTok fetch failed for ${handle}: ${e?.message}`);
        return 0;
    }
}

function parseCount(text: string): number {
    text = text.toUpperCase().replace(/,/g, '');
    let multiplier = 1;
    if (text.endsWith('K')) multiplier = 1000;
    else if (text.endsWith('M')) multiplier = 1000000;
    else if (text.endsWith('B')) multiplier = 1000000000;

    const num = parseFloat(text.replace(/[KMB]/g, ''));
    return Math.floor(num * multiplier);
}
