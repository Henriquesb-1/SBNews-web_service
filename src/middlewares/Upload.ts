import multer from "multer";
import path from "path";

export default function Upload(destFolter: string) {
    const Path = path.resolve() + `${destFolter}`;

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, Path),
        filename: (req, file, cb) => cb(null, file.originalname)
    });

    return multer({storage});
};