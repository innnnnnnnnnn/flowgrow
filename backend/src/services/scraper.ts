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
            case "FACEBOOK":
                return await fetchFacebookFollowers(cleanHandle);
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
        // Try exact count via API first
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${handle}`;
        const apiCmd = `curl -sL -m 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" -H "x-ig-app-id: 936619743392459" "${apiUrl}"`;
        const { stdout: apiStdout } = await execAsync(apiCmd);
        
        try {
            const apiMatch = apiStdout.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}/);
            if (apiMatch && apiMatch[1]) {
                return parseInt(apiMatch[1], 10);
            }
        } catch (e) {
            // fallback
        }

        // Fallback to meta tags
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

async function fetchFacebookFollowers(handle: string): Promise<number> {
    try {
        // Facebook URLs can be either profile names or IDs. We'll try the main page URL.
        const url = `https://www.facebook.com/${encodeURIComponent(handle)}`;
        const cmd = `curl -sL -m 10 -H "Accept-Language: zh-TW,zh,en-US,en" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36" "${url}"`;
        const { stdout } = await execAsync(cmd);

        // Pattern: "1.2K followers" or "1.2萬 位追蹤者"
        const patterns = [
            /([\d,.]+)\s*(萬|K|M|B)?\s*(位追蹤者|followers|fans)/i,
            /"follower_count":\s*(\d+)/i,
            /follower_count\\":(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = stdout.match(pattern);
            if (match && match[1]) {
                const numStr = match[1];
                const multiplierStr = match[2] || "";
                
                // If the pattern hit the exact count (group 2 is not a multiplier)
                if (!['萬', 'K', 'M', 'B'].includes(multiplierStr.toUpperCase()) && !multiplierStr) {
                     return parseInt(numStr, 10);
                }

                let value = numStr + (multiplierStr === '萬' ? '0000' : multiplierStr);
                // The parseCount function handles K, M, B
                if (multiplierStr === '萬') {
                   return Math.floor(parseFloat(numStr.replace(/,/g, '')) * 10000);
                } else {
                   return parseCount(numStr + multiplierStr);
                }
            }
        }

        return 0;
    } catch (e: any) {
        console.error(`Facebook fetch failed for ${handle}: ${e?.message}`);
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
