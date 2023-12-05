import { Request, Response } from "express";
import ReportService from "../model/service/ReportService";
import LogError from "../model/utils/LogError";
import Report from "../model/entities/Report";
import ReportRepository from "../model/repository/ReportRepository";

export default class ReportController {

    private reportRepository: ReportRepository;

    public constructor(reportService: ReportRepository = new ReportService()) {
        this.reportRepository = reportService;
     }

    public async getReports(req: Request, res: Response): Promise<void> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const type = <string>req.query.type || "comment";

        try {
            const { data, pages, total } = await this.reportRepository.get(page, type);
            res.status(200).json({ data, pages, total });
        } catch (error) {
            LogError(error, "controller")
            res.status(500).send();
        }
    }

    public async saveReport(req: Request, res: Response): Promise<void> {
        const report: Report = { ...req.body };

        try {
            if (!report.reason) {
                res.status(400).send();
            } else {
                await this.reportRepository.save(report);
                res.status(204).send();
            }
        } catch (error) {
            res.status(500).send();
        }
        res.status(500).send();
    }

    public async handleReport(req: Request, res: Response) {
        const report: Report = req.body.report;
        
        const willDeleteContent = !!req.body.willDeleteContent;
        const willPunishAuthor = !!req.body.willPushishAuthor;
        
        try {
            const feedBack = await this.reportRepository.handleReport(report, willDeleteContent, willPunishAuthor);
            res.status(200).send(feedBack);
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }
}