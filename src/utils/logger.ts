import { createLogger, transports, format, Logger as WinstonLogger, LoggerOptions } from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * A singleton logger class.
 */
class Logger {
    private static instance: Logger | null = null;
    private logger: WinstonLogger;
    private static isInitialized: boolean = false;

    /**
     * Private constructor to prevent direct instantiation.
     */
    private constructor() {
        const logFormat = format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.printf(({ level, message, timestamp, ...metadata }) => {
                let icon = '';
                switch (level) {
                    case 'info':
                        icon = 'ℹ️';
                        break;
                    case 'warn':
                        icon = '⚠️';
                        break;
                    case 'error':
                        icon = '❌';
                        break;
                    case 'debug':
                        icon = '🐛';
                        break;
                    default:
                        icon = '🔧';
                }
                return `${timestamp} ${icon} ${level.toUpperCase()}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
            }),
            format.colorize()
        );

        const logDir = path.resolve('/data/logs'); // Ensure 'logs' directory exists
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        const options: LoggerOptions = {
            level: process.env.LOG_LEVEL || 'debug', // Default log level
            transports: [
                new transports.Console(),
                new DailyRotateFile({
                    filename: path.join(logDir, 'application-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '10m',
                    maxFiles: '3d'
                })
            ],
            format: logFormat,
            exceptionHandlers: [
                new transports.File({ filename: path.join(logDir, 'exceptions.log') })
            ],
            rejectionHandlers: [
                new transports.File({ filename: path.join(logDir, 'rejections.log') })
            ],
            exitOnError: false,
        };

        try {
            this.logger = createLogger(options);
            Logger.isInitialized = true;
        } catch (error: any) {
            console.error('Failed to initialize logger:', error);
            throw new Error(`Failed to initialize logger: ${error.message}`);
        }
    }

    /**
     * Gets the singleton instance of the Logger.
     * @returns The Logger instance.
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Changes the log level dynamically.
     * @param level The new log level (e.g., 'debug', 'info', 'warn', 'error').
     */
    public setLevel(level: string): void {
        if (!Logger.isInitialized) {
            console.warn('Logger not yet initialized.');
            return;
        }
        this.logger.level = level;
    }

    /**
     * Logs a message with the specified level.
     * @param level The log level (e.g., 'error', 'warn', 'info', 'debug').
     * @param message The message to log.
     * @param meta Additional metadata to include in the log.
     */
    public log(level: string, message: string, meta?: any): void {
        if (!Logger.isInitialized) {
            console.warn('Logger not yet initialized.');
            return;
        }
        this.logger.log(level, message, meta);
    }

    /**
     * Logs a debug message.
     * @param message The message to log.
     * @param meta Additional metadata to include in the log.
     */
    public debug(message: string, meta?: any): void {
        this.log('debug', message, meta);
    }

    /**
     * Logs an info message.
     * @param message The message to log.
     * @param meta Optional metadata.
     */
    public info(message: string, meta?: any): void {
        this.log('info', message, meta);
    }

    /**
     * Logs a warning message.
     * @param message The message to log.
     * @param meta Optional metadata.
     */
    public warn(message: string, meta?: any): void {
        this.log('warn', message, meta);
    }

    /**
     * Logs an error message.
     * @param message The message to log.
     * @param meta Optional metadata.
     */
    public error(message: string, meta?: any): void {
        this.log('error', message, meta);
    }

        /**
     * Logs a fatal message.
     * @param message The message to log.
     * @param meta Optional metadata.
     */
    public fatal(message: string, meta?: any): void {
        this.log('fatal', message, meta);
    }
}

const logger = Logger.getInstance();
export default logger;
