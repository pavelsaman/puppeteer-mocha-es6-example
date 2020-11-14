import Loader from '../Objects/loader';

export default async function takeScreenshot (page, name) {
    await page.waitForSelector(Loader.loader, { visibility: true });
    await page.screenshot({ 
        path: './Results/Screenshots/' + name + '.png'
    });
}