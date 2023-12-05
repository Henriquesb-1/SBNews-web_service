import News from "../entities/News";

export default interface StatsRepository {
    getTotalUsers(): Promise<{users: number, muteds: number, banned: number}>;
    getNewsStats(userId: string): Promise<{totalVisits: number}>;
    getNewsMoreAccessed(userId: string): Promise<News>;
}