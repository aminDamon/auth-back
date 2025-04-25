const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

class FTPService {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = true;
    }

    async connect() {
        try {
            await this.client.access({
                host: '185.192.114.48',
                user: 'test',
                password: '75g3le9X?',
                port: 21,
                secure: false
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

    async getFileStream(remotePath) {
        try {
            await this.connect();
            const tempPath = path.join('/tmp', path.basename(remotePath));
            await this.downloadFile(remotePath, tempPath);
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
            throw err;
        }
    }
}

module.exports = new FTPService();