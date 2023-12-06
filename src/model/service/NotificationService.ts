import Notification from "../entities/Notification";
import NotificationRepository from "../repository/NotificationRepository";
import Connection from "../utils/Connection";

export default class NotificationService implements NotificationRepository {

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async get(page: number, userName: string): Promise<{ data: Notification[]; total?: number | undefined; }> {
        try {
            const connection = new Connection();

            const totalNotification = await connection.query("SELECT COUNT(id) as Total FROM user_notification WHERE user_target = (SELECT id FROM users WHERE name = ?)", [userName]);
            const [total] = totalNotification.map((notification: { Total: number }) => notification.Total);

            let data = <Notification[]>await connection.query(`
                SELECT 
                    notification.id, notification.type, notification.content, notification.news_origen as newsOrigenId, notification.hasBeenRead, 
                    (SELECT title FROM news WHERE id = notification.news_origen) as newsOrigenTitle,
                    causedBy.id as causedById, causedBy.name as causedByName,
                    userTarget.id as userTargetId, userTarget.name as userTargetName
                FROM 
                    user_notification notification, 
                    users causedBy,
                    users userTarget
                WHERE 
                    notification.user_target = (SELECT id FROM users WHERE name = ?)
                    AND causedBy.id = notification.caused_by
                    AND userTarget.id = notification.user_target
                LIMIT 10
                OFFSET ?
            `, [userName, (page * 10 - 10)]);

            await connection.closeConnection();

            data = data.map((notification: any) => {
                const causedBy = { id: notification.causedById, name: notification.causedByName };
                const userTarget = { id: notification.userTargetId, name: notification.userTargetName };

                if (notification.type === "comment" || notification.type === "answer") notification.content = `${causedBy.name} ${notification.content}`;

                return {
                    id: notification.id,
                    type: notification.type,
                    content: notification.content,
                    newsOrigen: {
                        id: notification.newsOrigenId,
                        title: notification.newsOrigenTitle
                    },
                    hasBeenRead: notification.hasBeenRead === 0 ? false : true,
                    causedBy,
                    userTarget
                };
            })

            return {
                data,
                total
            }

        } catch (error) {
            throw error;
        }
    }

    public async getUnreadNotificationCount(userId: number): Promise<number> {
        try {
            const connection = new Connection();
            
            const unreadNotificationCountQuery = <{total: number}[]> await connection.query("SELECT COUNT(id) as total FROM user_notification WHERE user_target = ? AND hasBeenRead = false", [userId]);
            await connection.closeConnection();

            const [unreadNotificationCount] = unreadNotificationCountQuery.map(notificationCount => notificationCount.total);
            return unreadNotificationCount;
        } catch (error) {
            throw error;
        }
    }

    public async save(data: Notification): Promise<void> {
        const { type, content, causedBy, userTarget, newsOrigen } = data;

        try {
            const connection = new Connection();

            await connection.query(`
                INSERT INTO user_notification (type, content, caused_by, user_target, news_origen)
                VALUES (?, ?, ?, ?, ?)
            `, [type, content, causedBy.id, userTarget.id, newsOrigen.id]);

            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async update(notification: Notification): Promise<any> {
        try {
            const connection = new Connection();
            await connection.query("UPDATE user_notification SET hasBeenRead = true WHERE id = ?", [notification.id]);
            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: string): Promise<any> {
        try {
            const connection = new Connection();

            await connection.query("DELETE FROM user_notification WHERE  id = ?", [id]);

            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async setAllRead(notifications: Notification[]): Promise<void> {
        try {
            const connection = new Connection();
            notifications.forEach(async notification => await connection.query("UPDATE user_notification SET hasBeenRead = true WHERE id = ?", [notification.id]))
            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }
}