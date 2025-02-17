import fs from 'fs';
import path from 'path';

class Storage {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    save(data: any) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    load() {
        if (fs.existsSync(this.filePath)) {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }
}

export default Storage;
