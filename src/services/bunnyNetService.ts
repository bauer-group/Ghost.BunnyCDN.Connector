import Config from '../config/config';
import logger from '../utils/logger';
import axios from 'axios';

class BunnyNetService {
    private apiKey: string;

    constructor() {
        this.apiKey = Config.BUNNYCDN_API_KEY;
    }

    public async purgeCache(url: string): Promise<void> {
        try {
            const response = await axios.post(
                `https://api.bunny.net/purge?url=${encodeURIComponent(url)}&async=true`,
                {},
                {
                    headers: {
                        'AccessKey': this.apiKey
                    },
                    timeout: 15000 // Timeout 15 seconds
                }
            );

            switch (response.status) {
                case 200:
                    logger.info(`Cache purged for ${url}`);
                    break;
                case 401:
                    logger.error(`Authorization failed for URL ${url}`);
                    break;
                case 500:
                    logger.error(`Internal Server Error while purging cache for URL ${url}`);
                    break;
                default:
                    logger.error(`Failed to purge cache for URL ${url} with status code ${response.status}`);
            }
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                logger.error(`Request timed out while purging cache for URL ${url}`);
            } else {
                logger.error(`Failed to purge cache for URL ${url} with error ${error.message}`);
            }
        }
    }
}

export default BunnyNetService;