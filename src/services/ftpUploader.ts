import SftpClient from "ssh2-sftp-client";
import { Readable } from "stream";
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import crypto from "crypto";

interface SftpConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    basePath: string;
    publicBaseUrl: string;
}

const DEFAULT_FTP_BASE_PATH = "/home/shopiators/store-assets";
const DEFAULT_PUBLIC_BASE_URL = "https://images.webiators.com/shopiators/store-assets";

export function validateSftpConfig(): SftpConfig {
    const missing: string[] = [];
    const host = process.env.SFTP_HOST?.trim();
    const portRaw = process.env.SFTP_PORT?.trim();
    const user = process.env.SFTP_USER?.trim();
    const password = process.env.SFTP_PASSWORD;

    if (!host) missing.push("SFTP_HOST");
    if (!portRaw) missing.push("SFTP_PORT");
    if (!user) missing.push("SFTP_USER");
    if (!password) missing.push("SFTP_PASSWORD");

    if (missing.length > 0) {
        throw new Error(`Missing required SFTP environment variables: ${missing.join(", ")}`);
    }

    const port = Number(portRaw);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error("Invalid SFTP_PORT environment variable: must be a valid TCP port (1-65535)");
    }

    return {
        host: host!,
        port,
        user: user!,
        password: password!,
        basePath: process.env.SFTP_BASE_PATH?.trim() || DEFAULT_FTP_BASE_PATH,
        publicBaseUrl: (process.env.SFTP_PUBLIC_BASE_URL?.trim() || DEFAULT_PUBLIC_BASE_URL).replace(/\/+$/, ""),
    };
}

async function uploadToFTP(buffer: Buffer, filename: string, folder?: string) {
    const ftpConfig = validateSftpConfig();
    const client = new SftpClient();

    try {
        await client.connect({
            host: ftpConfig.host,
            port: ftpConfig.port,
            username: ftpConfig.user,
            password: ftpConfig.password
        });

        let targetFolder = ftpConfig.basePath;
        if (folder) {
            targetFolder = `${ftpConfig.basePath}/${folder}`;
        }

        const dirExists = await client.exists(targetFolder);

        if (!dirExists) {
            try {
                await client.mkdir(targetFolder, true);
            } catch (mkdirError) {
                const existsAfterError = await client.exists(targetFolder);
                if (!existsAfterError) {
                    throw mkdirError;
                }
            }
        }

        const remotePath = `${targetFolder}/${filename}`;
        await client.put(buffer, remotePath);

        const urlPath = folder ? `${folder}/${filename}` : filename;
        return `${ftpConfig.publicBaseUrl}/${urlPath}`;
    } catch (err) {
        console.error("SFTP Upload Error:", err);
        throw err;
    } finally {
        await client.end();
    }
}

export const ftpUploader = {
    v2: {
        config: () => { },
        uploader: {
            upload: async (file: string, options: any = {}) => {
                let buffer: Buffer;
                let extension = "png";

                if (typeof file === "string") {
                    if (file.startsWith("http://") || file.startsWith("https://")) {
                        const response = await axios.get(file, { responseType: "arraybuffer" });
                        buffer = Buffer.from(response.data);

                        const match = file.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
                        if (match) extension = match[1];
                    } else if (file.startsWith("data:")) {
                        const matches = file.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            buffer = Buffer.from(matches[2], "base64");
                            const mimeType = matches[1];
                            extension = mimeType.split('/')[1] || "png";
                        } else {
                            throw new Error("Invalid Data URI");
                        }
                    } else {
                        buffer = await fs.readFile(file);
                        extension = path.extname(file).replace(".", "") || "png";
                    }
                } else {
                    throw new Error("Unsupported file input format");
                }

                let folder = options.folder || "";
                folder = folder.replace(/^\/+/, '').replace(/\/+$/, '');

                let filename = options.public_id || crypto.randomUUID();
                if (filename.includes('/')) {
                    const parts = filename.split('/');
                    filename = parts.pop();
                    if (!folder) {
                        folder = parts.join('/');
                    }
                }

                if (!filename.endsWith(`.${extension}`)) {
                    filename = `${filename}.${extension}`;
                }

                const secure_url = await uploadToFTP(buffer, filename, folder);

                return {
                    secure_url,
                    public_id: filename,
                    format: extension,
                    resource_type: options.resource_type || "image"
                };
            }
        }
    }
};

export default ftpUploader;
