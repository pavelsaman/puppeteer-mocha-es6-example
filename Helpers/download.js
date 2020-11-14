
export default async function setDownload (page, folder) {
    await page._client.send(
        'Page.setDownloadBehavior',
        {
            behavior: 'allow',
            downloadPath: folder
        }
    );
}