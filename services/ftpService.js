const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const os = require('os');

class FTPService {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = true;
        this.isConnected = false;
        this.tempDir = path.join(os.tmpdir(), 'ftp-downloads');
        
        // ایجاد پوشه موقت اگر وجود نداشته باشد
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async connect() {
        if (this.isConnected) {
            return true;
        }

        try {
            await this.client.access({
                host: process.env.FTP_HOST || '185.192.114.48',
                user: process.env.FTP_USER || 'test',
                password: process.env.FTP_PASSWORD || '75g3le9X?',
                port: parseInt(process.env.FTP_PORT) || 21,
                secure: false
            });
            this.isConnected = true;
            return true;
        } catch (err) {
            console.error('FTP connection error:', err);
            this.isConnected = false;
            throw err;
        }
    }

    async listFiles(path = '/') {
        try {
            if (!this.isConnected) {
            await this.connect();
            }
            const files = await this.client.list(path);
            return files;
        } catch (err) {
            console.error('FTP list error:', err);
            this.isConnected = false;
            throw err;
        }
    }

    async downloadFile(remotePath, localPath) {
        try {
            if (!this.isConnected) {
            await this.connect();
            }
            await this.client.downloadTo(localPath, remotePath);
            return true;
        } catch (err) {
            console.error('FTP download error:', err);
            this.isConnected = false;
            throw err;
        }
    }

    async getFileStream(remotePath) {
        try {
            if (!this.isConnected) {
            await this.connect();
            }
            
            // ایجاد مسیر موقت برای فایل
            const tempPath = path.join(this.tempDir, path.basename(remotePath));
            
            // دانلود فایل
            await this.downloadFile(remotePath, tempPath);
            
            // ایجاد استریم خواندن
            const stream = fs.createReadStream(tempPath);

            // حذف فایل موقت پس از اتمام استریم
            stream.on('close', () => {
                try {
                    fs.unlinkSync(tempPath);
                } catch (err) {
                    console.error('Error deleting temp file:', err);
                }
            });

            return stream;
        } catch (err) {
            console.error('Error creating file stream:', err);
            this.isConnected = false;
            throw err;
        }
    }

    async close() {
        if (this.isConnected) {
            try {
                await this.client.close();
                this.isConnected = false;
            } catch (err) {
                console.error('Error closing FTP connection:', err);
            }
        }
    }
}

module.exports = new FTPService();