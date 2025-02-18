import Config from '../config/config';
import logger from '../utils/logger';

class BunnyNetService {
    //private storage: BunnyCDNStorage;

    constructor() {
        //this.storage = new BunnyCDNStorage(Config.BUNNY_STORAGE_ZONE, Config.BUNNY_API_KEY);
    }

    public async purgeCache(url: string): Promise<void> {
        try {
            //await this.storage.purgeCache(url);
            logger.info(`Cache purged for URL: ${url}`);
        } catch (error: any) {
            logger.error(`Failed to purge cache for URL: ${url} - ${error.message}`);
        }
    }
}

export default BunnyNetService;
