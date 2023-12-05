import Notification from "../entities/Notification";
import CrudRepository from "./CrudRepository";

export default interface NotificationRepository extends CrudRepository<Notification> {
    getUnreadNotificationCount(userId: number): Promise<number>;
}