import News from "../entities/News";
import StatsRepository from "../repository/StatsRepository";
import Connection from "../utils/Connection";

export default class StatsService implements StatsRepository {

    public async getTotalUsers(): Promise<{ users: number, muteds: number, banned: number }> {
        try {
            const connection = new Connection();
            const now = Math.floor(Date.now() / 1000);

            const totalUsersQuery = await connection.query(`
                SELECT tu.totalUsers, mu.totalMuted, tb.totalBanned
                FROM (
                    SELECT COUNT(id) as totalUsers
                    FROM users
                ) tu, (
                    SELECT COUNT(id) as totalMuted
                    FROM users
                    WHERE muted_time > ?
                ) mu, (
                    SELECT COUNT(id) as totalBanned
                    FROM users
                    WHERE isBanned = 1
                ) tb
            `, [now])

            const [usersCount] = totalUsersQuery.map((userCount: any) => userCount);
            const { totalUsers, totalMuted, totalBanned } = usersCount;

            return {
                users: totalUsers,
                muteds: totalMuted,
                banned: totalBanned
            }
        } catch (error) {
            throw error;
        }
    }

    public async getNewsStats(userId: string): Promise<{ totalVisits: number }> {
        try {
            const connection = new Connection();
            const statsQuery = await connection.query("SELECT SUM(visits) as totalVisits FROM news WHERE user_id = ?", [userId]);
            await connection.closeConnection();

            const [totalVisits] = statsQuery.map((stats: { totalVisits: number }) => stats.totalVisits);
            return totalVisits;
        } catch (error) {
            throw error;
        }
    }

    public async getNewsMoreAccessed(userId: string): Promise<News> {
        try {
            const connection = new Connection();

            const newsMoreAccessedQuery = <News[]> await connection.query(`
                SELECT id, title, description, image_url as imageUrl, visits
                FROM news
                WHERE user_id = ?
                    AND visits = (SELECT MAX(visits) FROM news WHERE user_id = ?)
            `, [userId, userId]);

            const [news] = newsMoreAccessedQuery.map((news: News) => news);

            return news;
        } catch (error) {
            throw error;
        }
    }
}