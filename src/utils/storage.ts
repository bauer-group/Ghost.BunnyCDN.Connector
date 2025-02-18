import fs from 'fs';
import path from 'path';
import logger from './logger'; // Import the logger

/**
 * Storage interface for data persistence.
 */
interface IStorage {
    save(data: any): void;
    load(): any;
}

/**
 * Implements a file-based storage mechanism.
 */
class Storage implements IStorage {
    private filePath: string;

    /**
     * Constructs a new Storage instance.
     * @param filePath The path to the storage file.
     */
    constructor(filePath: string) {
        this.filePath = filePath;
        this.ensureDirectoryExists();
    }

    private ensureDirectoryExists(): void {
        const dir = path.dirname(this.filePath);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                logger.info(`Created directory: ${dir}`);
            }
        } catch (error: any) {
            logger.error(`Error creating directory: ${dir}`, error);
            throw new Error(`Failed to create directory: ${error.message}`); // Re-throw to prevent further execution
        }
    }

    /**
     * Saves data to the storage file.
     * @param data The data to be saved (must be JSON serializable).
     */
    save(data: any): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
            logger.debug(`Saved data to ${this.filePath}`);
        } catch (error: any) {
            logger.error(`Error saving data to ${this.filePath}`, error);
            throw new Error(`Failed to save data: ${error.message}`);
        }
    }

    /**
     * Loads data from the storage file.
     * @returns The loaded data, or an empty object if the file does not exist or an error occurs.
     */
    load(): any {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf-8');
                const parsedData = JSON.parse(data);
                if (typeof parsedData === 'object' && parsedData !== null) {
                    logger.debug(`Loaded data from ${this.filePath}`);
                    return parsedData;
                } else {
                    logger.warn(`Invalid data format in ${this.filePath}. Returning empty object.`);
                    return {};
                }
            }
            logger.info(`No data found at ${this.filePath}. Returning empty object.`);
            return {};
        } catch (error: any) {
            logger.warn(`Error loading data from ${this.filePath}`, error);
            return {};
        }
    }
}

export default Storage;
