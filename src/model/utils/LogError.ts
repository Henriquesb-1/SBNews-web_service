import fs from "fs";
import path from "path";

export default function LogError(error: any) {
    const err = new Error(error);
    const pathToFile = `${path.resolve()}/src/errorlogs.txt`;
    const date = new Date();
    
    const data = `Error occurred at ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} \n ${err.stack} \n ------------------- \n`

    fs.appendFile(pathToFile, data || "", err => {
        if (err) console.log(err);
    });
}