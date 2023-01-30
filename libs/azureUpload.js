const { StorageSharedKeyCredential, BlobServiceClient } = require("@azure/storage-blob");


async function AzureUpload({container, file, nameFile}){
    const azureAccount = process.env.AZURE_ACCOUNT
    const key = process.env.AZURE_KEY
    const sharedKeyCredential = new StorageSharedKeyCredential(azureAccount, key);
    const blobServiceClient = new BlobServiceClient(
      `https://${azureAccount}.blob.core.windows.net`,
      sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(container);
    var matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var buffer = Buffer.from(matches[2], "base64");
    console.log('buffer', buffer);
    const blockBlobClient = containerClient.getBlockBlobClient(String(nameFile));
    await blockBlobClient.upload(buffer, buffer.byteLength, { blobHTTPHeaders: { blobContentType: "image/jpeg" } })
}

module.exports = AzureUpload