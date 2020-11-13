
export default async function getUrl (page) {
    return await page.evaluate(() => document.URL);
}