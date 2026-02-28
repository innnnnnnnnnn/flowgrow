import axios from "axios";

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
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000
        });

        // Pattern: "614M Followers" in meta tags
        const patterns = [
            /content=\"([\d,.]+)([KMB]?)\s+Followers/i,
            /([\d,.]+)([KMB]?)\s+Followers/i
        ];

        for (const pattern of patterns) {
            const match = response.data.match(pattern);
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
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            },
            timeout: 10000
        });

        // Pattern 1: JSON
        const jsonMatch = response.data.match(/\"followerCount\":(\d+)/);
        if (jsonMatch && jsonMatch[1]) {
            return parseInt(jsonMatch[1]);
        }

        // Pattern 2: Meta
        const metaMatch = response.data.match(/(\d+(?:\.\d+)?[KMB]?)\s+Followers/i);
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
