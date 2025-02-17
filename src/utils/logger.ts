import { createLogger, transports, format } from 'winston';

class Logger {
    private static instance: Logger;
    public logger;

    private constructor() {
        this.logger = createLogger({
            level: 'debug',
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf(({ timestamp, level, message }) => {
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
                    return `${timestamp} ${icon} ${level}: ${message}`;
                })
            ),
            transports: [
                new transports.Console()
            ]
        });
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
}

export default Logger.getInstance().logger;
