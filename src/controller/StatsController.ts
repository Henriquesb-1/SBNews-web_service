import { Request, Response } from "express";
import StatsService from "../model/service/StatsService";
import LogError from "../model/utils/LogError";
import StatsRepository from "../model/repository/StatsRepository";

export default class StatsController {

    private statsRepository: StatsRepository = new StatsService();

    public async getTotalUsers(req: Request, res: Response) {
        try {
            const { users, banned, muteds } = await this.statsRepository.getTotalUsers();
            res.status(200).json({ users, banned, muteds });
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async getNewsStats(req: Request, res: Response) {
        const type = <string>req.query.type || "visits";
        const userId = <string>req.query.userId;

        try {
            if (type === "visits") {
                const totalVisits = await this.statsRepository.getNewsStats(userId);
                res.status(200).json(totalVisits);
            } else if(type === "newsMoreAccessed") {
                const news = await this.statsRepository.getNewsMoreAccessed(userId);
                res.status(200).json(news);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send();
        }
    }
}