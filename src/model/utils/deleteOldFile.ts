import fs from "fs";
import path from "path";

export default function DeleteOldFile(fileName: string, fileFolder: string, defaultFile: string) {
    if(fileName !== defaultFile) {
        fs.unlink(`${path.resolve()}/upload/${fileFolder}/${fileName}`, err => {
            if(err) throw err;
        });
    };
};