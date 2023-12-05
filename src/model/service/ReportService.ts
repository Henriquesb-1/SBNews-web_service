import Report from "../entities/Report";
import User from "../entities/User";
import UserBuilder from "../entities/builders/UserBuilder";
import ReportRepository from "../repository/ReportRepository";
import Connection from "../utils/Connection";
import getNecessariesPages from "../utils/Paginator";
import GetTotals from "./GetTotals";

export default class ReportService implements ReportRepository {

    private limit = 10;

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async get(page: number, type: string): Promise<{ data: Report[]; pages: number }> {
        try {
            const connection = new Connection();

            const total = await GetTotals.getTotalReports(type);

            let reportsQuery = await connection.query(`
                SELECT 
                    reports.id, reports.type, reports.reason, reports.content, reports.news_target as newsTarget, reports.user_author as authorId, reports.user_target as reportedId, reports.comment_target as commentId, reports.answer_target as answerId,
                    userAuthor.name as authorName, 
                    userReported.id as reportedId, userReported.name as reportedName, userReported.muted_time, userReported.warned_times as warnedTimes, userReported.user_type as userType, userReported.times_silenced as silencedTimes, userReported.isBanned
                FROM 
                    reports, 
                    users userAuthor, 
                    users userReported
                WHERE 
                    reports.type = ?
                    AND userAuthor.id = reports.user_author 
                    AND userReported.id = reports.user_target 
                LIMIT ?
                OFFSET ?
            `, [type, this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const reports = reportsQuery.map((report: any) => {
                const author = { id: report.authorId, name: report.authorName };
                const reported = { id: report.reportedId, name: report.reportedName, mutedTime: report.muted_time, warnedTimes: report.warnedTimes, silencedTimes: report.silencedTimes, isBanned: report.isBanned, }
                return new Report(report.id, report.type, report.content, report.reason, author, reported, report.newsOrigenId, report.commentTarget, report.answerTarget);
            })

            const pages = getNecessariesPages(total, this.limit);

            return {
                data: reports,
                pages
            }
        } catch (error) {
            throw error;
        }
    }

    public async save(report: Report): Promise<any> {
        const { type, reason, content, author, reported, newsOrigenId, commentTarget, answerTarget } = report;

        try {
            const connection = new Connection();

            await connection.query(` 
                INSERT INTO reports (type, reason, content, user_author, user_target, news_target, comment_target, answer_target)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [type, reason, content, author.id, reported.id, newsOrigenId, commentTarget, answerTarget]);

            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async handleReport(report: Report, willDeleteContent: boolean, willPunishAuthor: boolean): Promise<string> {

        try {
            const { reported } = report;
            const { mutedTime, silencedTimes, warnedTimes, isBanned } = reported;

            const user = new UserBuilder()
                .addMutedTime(mutedTime || 0)
                .addTimesSilenced(silencedTimes || 0)
                .addWarnedTime(warnedTimes || 0)
                .addIsBanned(isBanned || false)
                .buildUser();


            const connection = new Connection();
            await connection.transaction("begin");

            try {
                if (willDeleteContent) {
                    if (report.type === "comment") {
                        // await connection.query(`DELETE FROM answers_reactions WHERE comment_id = ?`, [report.commentTarget]);
                        // await connection.query(`DELETE FROM comments_reactions WHERE comment_id = ?`, [report.commentTarget]);
                        await connection.query(`DELETE FROM comments WHERE id = ?`, [report.commentTarget]);
                    } else if (report.type === "answer") {
                        // await connection.query(`DELETE FROM answers_reactions WHERE id = ?`, [report.answerTarget]);
                        await connection.query(`DELETE FROM answers WHERE id = ?`, [report.answerTarget]);
                    }
                }

                if (willPunishAuthor) {
                    await connection.query(`
                        UPDATE users
                        SET muted_time = ?, times_silenced = ?, warned_times = ?, isBanned = ?
                        WHERE id = ?
                    `, [user.mutedTime, user.timesSilenced, user.warnedTimes, user.isBanned, reported.id]);
                }


                await connection.query(`DELETE FROM reports WHERE id = ?`, [report.id]);

                await connection.transaction("commit");
                await connection.closeConnection();

                return user.feedBack;
            } catch (error) {
                await connection.transaction("rollback");
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async update(data: any, params?: any): Promise<any> {

    }

    public async delete({ id }: { id: number }): Promise<any> {
        try {
            const connection = new Connection();
            await connection.query(`DELETE FROM reports WHERE id = ?`, [id]);
            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }
}