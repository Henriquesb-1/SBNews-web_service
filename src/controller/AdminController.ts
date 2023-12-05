import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import LogError from "../model/utils/LogError";

export default class AdminConfig {

    public async getAdminConfig(req: Request, res: Response) {
        try {
            const config = JSON.parse(fs.readFileSync(path.resolve() + "/src/.adminConfig.json").toString());
            res.status(200).json(config);
        } catch (error) {
            res.status(500).send();
        }
    }

    public async changeAdminConfig(req: Request, res: Response) {
        const newConfig = { ...req.body };
        console.log(newConfig)
        try {
            fs.writeFileSync(path.resolve() + "/src/.adminConfig.json", JSON.stringify(newConfig));
            res.status(204).send();
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }
}