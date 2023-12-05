import { Request, Response } from "express";
import NotificationService from "../model/service/NotificationService";
import LogError from "../model/utils/LogError";
import Notification from "../model/entities/Notification";
import NotificationRepository from "../model/repository/NotificationRepository";

export default class NotificationController {

    private notificationRepository: NotificationRepository;

    public constructor(notificationService: NotificationRepository = new NotificationService()) {
        this.notificationRepository = notificationService;
    }

    public async getNotifications(req: Request, res: Response): Promise<void> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const userId = <string>req.query.userId;

        try {
            const { data, pages, total } = await this.notificationRepository.get(page, userId);
            res.status(200).json({ data, pages, total });
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }

    public async getUnreadNotificationCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = Number.parseInt(<string>req.params.userId);
            const notificationCount = await this.notificationRepository.getUnreadNotificationCount(userId);

            res.status(200).json(notificationCount);
        } catch (error) {
            console.log(error);
            res.status(500).send();
        }
    }

    public async saveNotification(req: Request, res: Response): Promise<void> {
        const notification: Notification = { ...req.body };

        try {
            await this.notificationRepository.save(notification);
            res.status(204).send();
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }

    public async setNotificationRead(req: Request, res: Response): Promise<void> {
        const notification: Notification = { ...req.body };

        try {
            await this.notificationRepository.update(notification);
            res.status(204).send();
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }

    public async deleteNotification(req: Request, res: Response): Promise<void> {
        const notificationId = <string>req.params.id;

        try {
            await this.notificationRepository.delete(notificationId);
            res.status(204).send();
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }
}