import Connection from "../utils/Connection";

export default abstract class GetTotals {

    public static async getAnswersTotal(commentId: number) {
        try {
            const connection = new Connection();

            const answersCount = await connection.query("SELECT COUNT(id) as Total FROM answers WHERE comment_id = ?", [commentId]);

            const [total] = answersCount.map((news: { Total: number }) => news.Total);

            await connection.closeConnection();

            return total;
        } catch (error) {
            throw error;
        }
    }

    public static async getTotalComments(newsId: number) {
        try {
            const connection = new Connection();

            const countComments = await connection.query("SELECT COUNT(id) as Total FROM comments WHERE news_id = ?", [newsId]);
            const [total] = countComments.map((comment: { Total: number }) => comment.Total);

            await connection.closeConnection();

            return total;
        } catch (error) {
            throw error;
        }
    }

    public static async getTotalReports(type: string) {
        try {
            const connection = new Connection();

            const countComments = await connection.query("SELECT COUNT(id) as total FROM reports WHERE type = ?", [type]);
            const [total] = countComments.map((comment: { total: number }) => comment.total);

            await connection.closeConnection();

            return total;
        } catch (error) {
            throw error;
        }
    }
}