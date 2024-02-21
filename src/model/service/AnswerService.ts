import Answer from "../entities/Answer";
import Notification from "../entities/Notification";
import AnswerRepository from "../repository/AnswerRepository";
import NotificationRepository from "../repository/NotificationRepository";
import Connection from "../utils/Connection";
import renderDate from "../utils/parseDate";
import NotificationService from "./NotificationService";

export default class AnswerService implements AnswerRepository {
    private notificationRepository: NotificationRepository;

    public constructor() {
        this.notificationRepository = new NotificationService();
    }


    private limit = 5;

    public async save(answer: Answer): Promise<number> {
        const { content, author, commentId, datePosted, newsId, userTagged } = answer;

        try {
            const connection = new Connection();

            try {
                const save = await connection.query(`
                    INSERT INTO answers (content, author_id, comment_id, date_posted)
                    VALUES (?, ?, ?, ?)
                `, [content, author.id, commentId, datePosted]);

                if(userTagged) {
                    const notification: Notification = {
                        id: 0,
                        type: "answer",
                        content: `respondeu seu comentário`,
                        newsOrigen: {
                            id: newsId || 0,
                            title: ""
                        },
                        hasBeenRead: false,
                        userTarget: {
                            id: userTagged?.id || 0,
                            name: ""
                        },
                        causedBy: {
                            id: author.id,
                            name: ""
                        }
                    }

                    await this.notificationRepository.save(notification);
                }

                await connection.closeConnection();

                return save.insertId;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async update(data: Answer): Promise<void> {
        const { content, answerId } = data;

        try {
            const connection = new Connection();

            try {
                await connection.query("UPDATE answers SET content = ? WHERE id = ?", [content, answerId]);
                await connection.closeConnection();
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    public async getTotal(commentId: number) {
        try {
            const connection = new Connection();

            const answersCount = await connection.query("SELECT COUNT(id) as Total FROM answers WHERE comment_id = ?", [commentId]);

            const [total] = answersCount.map((news: { Total: number }) => news.Total);

            await connection.closeConnection();

            return total;
        } catch (error) {
            throw error;
        }
    };

    public async get(page: number, commentId: number): Promise<{ data: Answer[] }> {
        try {
            const connection = new Connection();

            const answersQuery = await connection.query(`
                SELECT 
                    answers.id as answerId, answers.content as content, answers.comment_id as commentId, answers.date_posted as datePosted, answers.agree_count as agreeCount, answers.disagree_count as disagreeCount,
                    users.id as authorId, users.name as authorName, users.avatar
                FROM 
                    users, answers
                WHERE 
                    answers.comment_id = ? 
                    AND users.id = answers.author_id
                ORDER BY date_posted ASC
                LIMIT ?
                OFFSET ?
            `, [commentId, this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const answers = answersQuery.map((answer: any) => {
                const author = { id: answer.authorId, name: answer.authorName, imageUrl: `http:/localhost:3001/userAvatar/${answer.avatar}` };
                const reactions = { agreeCount: answer.agreeCount, disagreeCount: answer.disagreeCount };
                return new Answer(answer.content, answer.answerId, answer.commentId, author, renderDate(answer.datePosted), reactions);
            })

            return { data: answers }
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: string): Promise<any> {
        try {
            const connection = new Connection();

            await connection.transaction("begin");

            try {
                await connection.query(`DELETE FROM answers_reactions WHERE answer_id = ?`, [id]);
                await connection.query(`DELETE FROM answers WHERE id = ?`, [id]);

                connection.transaction("commit");
            } catch (error) {
                await connection.transaction("rollback");

                throw error;
            };

            await connection.closeConnection();
        } catch (error) {
        }

    }
}