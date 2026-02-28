import axios from "axios";

export async function getFollowerCount(platform: string, handle: string): Promise<number> {
    const cleanHandle = handle.replace("@", "");

    try {
        switch (platform.toUpperCase()) {
            case "INSTAGRAM":
                return await fetchInstagramFollowers(cleanHandle);
            case "TIKTOK":
                return await fetchTikTokFollowers(cleanHandle);
            default:
                return 0;
        }
    } catch (error) {
        console.error(`Error fetching followers for ${platform} ${handle}:`, error);
        return 0;
    }
}

async function fetchInstagramFollowers(handle: string): Promise<number> {
    try {
        // Attempting to scrape public meta tags or shared data
        // Note: This is fragile and many servers block direct scraping
        const response = await axios.get(`https://www.instagram.com/${handle}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Look for "edge_followed_by" in script tags
        const match = response.data.match(/\"edge_followed_by\":\{\"count\":(\d+)\}/);
        if (match && match[1]) {
            return parseInt(match[1]);
        }

        // Fallback: search for "followers" in the title or meta
        const metaMatch = response.data.match(/(\d+)\s+Followers/i);
        if (metaMatch && metaMatch[1]) {
            return parseInt(metaMatch[1]);
        }

        return 0;
    } catch (e) {
        return 0;
    }
}

async function fetchTikTokFollowers(handle: string): Promise<number> {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${handle}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // TikTok often hides this in __UNIVERSAL_DATA_FOR_REAHT_APP__
        const match = response.data.match(/\"followerCount\":(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1]);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}
