const ftp = require('basic-ftp');

class FTPService {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = true; // برای دیباگ
    }

    async connect() {
        try {
            await this.client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASS,
                port: process.env.FTP_PORT || 21,
                secure: process.env.FTP_SECURE === 'true'
            });
            return true;
        } catch (err) {
            console.error('FTP connection error:', err);
            throw err;
        }
    }

    async listFiles(path = '/') {
        try {
            await this.connect();
            const files = await this.client.list(path);
            await this.client.close();
            return files;
        } catch (err) {
            console.error('FTP list error:', err);
            throw err;
        }
    }

    async downloadFile(remotePath, localPath) {
        try {
            await this.connect();
            await this.client.downloadTo(localPath, remotePath);
            await this.client.close();
            return true;
        } catch (err) {
            console.error('FTP download error:', err);
            throw err;
        }
    }
}

module.exports = new FTPService();