
import { EnvKey, getRequiredConfig } from '@/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';

const logger = createLogger('bodyStorageService');

const containerName = 'event-data-body';
logger.info('Getting container client for {containerName}', { containerName });

const containerClient = BlobServiceClient.fromConnectionString(getRequiredConfig(EnvKey.AZURE_STORAGE_CONNECTION_STRING)).getContainerClient(containerName);

export function storeBody(hookId: string, eventId: string, body: string): { promise: Promise<void>, fileName: string } {

    const fileName = `${hookId}/${eventId}.txt`;

    const blobClient = containerClient.getBlockBlobClient(fileName);

    const startTime = performance.now();

    logger.debug('Uploading content to blob {fileName}', { fileName });

    return {
        fileName,
        promise: new Promise((res, rej) => {
            blobClient.upload(body, body.length).then(() => {
                logger.debug('Finished blob save for {fileName} in {elapsed}ms', { fileName, elapsed: performance.now() - startTime });
                res();
            }).catch(rej);
        })
    };

}

export async function getBody(fileNameFull: string): Promise<Buffer> {
    const startTime = performance.now();
    const blobClient = containerClient.getBlockBlobClient(fileNameFull);
    const buff = await blobClient.downloadToBuffer();
    logger.debug('Downloaded event body {fileNameFull} in {elapsed}ms', { fileNameFull, elapsed: performance.now() - startTime });
    return buff;
}

export async function deleteBody(fileNameFull: string): Promise<void> {
    const startTime = performance.now();
    const blobClient = containerClient.getBlockBlobClient(fileNameFull);
    await blobClient.delete();
    logger.debug('Deleted event body {fileNameFull} in {elapsed}ms', { fileNameFull, elapsed: performance.now() - startTime });
}

/*

    private static readonly _containerClient = new ContainerClient(`${blob.url}/${blob.containerName}`, new StorageSharedKeyCredential(blob.accountName, blob.accountKey));

    private get _containerClient(): ContainerClient { return BlobClient._containerClient; }

    public async getMetadata(fileNameFull: string): Promise<Record<string, string>> {
        const blobClient = this._containerClient.getBlockBlobClient(fileNameFull);
        try {
            const properties = await blobClient.getProperties();
            return properties.metadata ?? {};
        } catch (e) {
            if (e.statusCode === 404) { return {}; }
            logger.warn('Error getting {fileName} metadata - {message}', { fileName: fileNameFull, message: e.message ?? e });
            return {};
        }
    }

    public getBufferAsync(fileNameFull: string): Promise<Buffer> {
        const blobClient = this._containerClient.getBlockBlobClient(fileNameFull);
        return blobClient.downloadToBuffer();
    }

    public uploadStringAsync(fileNameFull: string, content: string, metadata?: { [key: string]: string }): Promise<any> {
        return this.uploadAsync(fileNameFull, content, metadata);
    }

    public async uploadStreamAsync(fileNameFull: string, content: Readable, metadata?: Record<string, string> | null): Promise<any> {
        return this.uploadAsync(fileNameFull, content, metadata);
    }

    private async uploadAsync(fileNameFull: string, content: any, metadata?: Record<string, string> | null): Promise<any> {
        const blockBlobClient = this._containerClient.getBlockBlobClient(fileNameFull);

        const startTime = Date.now();

        if (content instanceof Readable) {
            logger.debug('Uploading stream to blob {fileName}', { fileName: fileNameFull });
            await blockBlobClient.uploadStream(content, null || undefined);
        } else {
            logger.debug('Uploading content to blob {fileName}', { fileName: fileNameFull });
            await blockBlobClient.upload(content, content.length);
        }

        if (metadata) {
            logger.debug('Uploading metadata to blob {fileName}', { fileName: fileNameFull });
            await blockBlobClient.setMetadata(metadata);
        }

        logger.info('Completed blob save for {fileName} in {elapsed}ms', { fileName: fileNameFull, elapsed: Date.now() - startTime });

    }
   */