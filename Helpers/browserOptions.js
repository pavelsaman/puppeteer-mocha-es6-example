import dotenv from 'dotenv';
import config from '../config';


dotenv.config();

export default function browserConfig () {  
    if (!process.env.BROWSER)
        return config.browserOptions.headless;
    return config.browserOptions[process.env.BROWSER];
}
