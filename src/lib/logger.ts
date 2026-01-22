import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG_PATH = path.join(LOG_DIR, 'error.log');
const APP_LOG_PATH = path.join(LOG_DIR, 'app.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

export class Logger {
    private static formatMessage(level: string, message: string, context?: any): string {
        const timestamp = new Date().toISOString();
        let formattedContext = '';
        if (context) {
            try {
                formattedContext = ` | Context: ${JSON.stringify(context)}`;
            } catch (e) {
                formattedContext = ` | Context: [Circular or Unserializable]`;
            }
        }
        return `[${timestamp}] [${level}] ${message}${formattedContext}\n`;
    }

    private static writeToFile(filePath: string, content: string) {
        try {
            fs.appendFileSync(filePath, content, 'utf8');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    static info(message: string, context?: any) {
        const log = this.formatMessage('INFO', message, context);
        console.log(log.trim());
        this.writeToFile(APP_LOG_PATH, log);
    }

    static error(message: string, context?: any) {
        const log = this.formatMessage('ERROR', message, context);
        console.error(log.trim());
        this.writeToFile(ERROR_LOG_PATH, log);
        this.writeToFile(APP_LOG_PATH, log);
    }

    static warn(message: string, context?: any) {
        const log = this.formatMessage('WARN', message, context);
        console.warn(log.trim());
        this.writeToFile(APP_LOG_PATH, log);
    }
}
