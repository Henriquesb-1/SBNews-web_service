import Notification from "../entities/Notification";
import Reaction from "../entities/Reaction";
import NotificationRepository from "../repository/NotificationRepository";
import ReactionRepository from "../repository/ReactionRepository";
import Connection from "../utils/Connection";
import LogError from "../utils/LogError";
import NotificationService from "./NotificationService";

export default class ReactionService implements ReactionRepository {
    private notificationRepository: NotificationRepository;

    public constructor() {
        this.notificationRepository = new NotificationService();
    }

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    private async updateReactionCount(connection: Connection, agreeCount: number, disagreeCount: number, commentId: number, type: string = "comment"): Promise<void> {
        try {
            if (type === "comment") {
                await connection.query(`
                    UPDATE comments
                    SET agree_count = ?, disagree_count = ?
                    WHERE id = ?
                `, [agreeCount, disagreeCount, commentId])
            } else if(type === "answer") {
                await connection.query(`
                    UPDATE answers
                    SET agree_count = ?, disagree_count = ?
                    WHERE id = ?
                `, [agreeCount, disagreeCount, commentId])
            }
        } catch (error) {
            throw error;
        }
    }

    public async getCommentAlreadyReacted(userId: string, type: string): Promise<Reaction[]> {
        try {
            const connection = new Connection();

            let commentsAlreadyReacted: Reaction[] = [{agreeOrDisagree: "", causedBy: 0, commentId: 0, userTarget: 0}];

            if(type === "comment") {
                commentsAlreadyReacted = <Reaction[]>await connection.query(`
                    SELECT agree_or_disagree as agreeOrDisagree, comment_id as commentId 
                    FROM comments_reactions 
                    WHERE caused_by = ?
                `, [userId]);
            } else if(type === "answer") {
                commentsAlreadyReacted = <Reaction[]>await connection.query(`
                    SELECT agree_or_disagree as agreeOrDisagree, answer_id as commentId 
                    FROM answers_reactions 
                    WHERE caused_by = ?
                `, [userId]);
            }

            await connection.closeConnection();

            return commentsAlreadyReacted;
        } catch (error) {
            LogError(error, "model");
            throw error;
        };
    }

    public async get(page: number, param?: any): Promise<any> {

    }

    public async save(reaction: Reaction, { type, agreeCount, disagreeCount }: { type: string, agreeCount: number, disagreeCount: number }): Promise<void> {
        const { agreeOrDisagree, causedBy, commentId, userTarget, newsId } = reaction;

        try {
            let connection = new Connection();

            await connection.transaction("begin");

            try {
                if (type === "comment") {
                    await connection.query(`
                        INSERT INTO comments_reactions (agree_or_disagree, caused_by, user_target, comment_id)
                        VALUES(?, ?, ?, ?)
                    `, [agreeOrDisagree, causedBy, userTarget, commentId]);

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, commentId);
                } else if (type === "answer") {
                    await connection.query(`
                        INSERT INTO answers_reactions(agree_or_disagree, caused_by, answer_id, user_target)
                        VALUES(?, ?, ?, ?)
                    `, [agreeOrDisagree, causedBy, commentId, userTarget]);

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, commentId, "answer");

                    const notification: Notification = {
                        id: 0,
                        type,
                        content: agreeOrDisagree === "agree" ? "concorda com seu comentario" : "discorda do seu comentário",
                        newsOrigen: {
                            id: newsId || 0,
                            title: ""
                        },
                        hasBeenRead: false,
                        userTarget: {
                            id: userTarget,
                            name: ""
                        },
                        causedBy: {
                            id: causedBy,
                            name: ""
                        }
                    }

                    await this.notificationRepository.save(notification);
                }

                await connection.transaction("commit");

            } catch (error) {
                console.log(error);
                await connection.transaction("rollback");
                throw error;
            }
            await connection.closeConnection();
        } catch (error) {
            LogError(error, "model");
            throw error;
        }
    }

    public async update(reaction: Reaction, { type, agreeCount, disagreeCount }: { type: string, agreeCount: number, disagreeCount: number }): Promise<any> {
        const { agreeOrDisagree, userTarget, causedBy, commentId } = reaction;

        try {
            let connection = new Connection();

            await connection.transaction("begin");

            try {
                if (type === "comment") {
                    await connection.query("UPDATE comments_reactions SET agree_or_disagree = ? WHERE comment_id = ? AND caused_by = ?", [agreeOrDisagree, commentId, causedBy]);

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, commentId);
                } else if (type === "answer") {
                    await connection.query("UPDATE answers_reactions SET agree_or_disagree = ? WHERE answer_id = ? AND caused_by = ? ", [agreeOrDisagree, commentId, causedBy])

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, commentId, "answer");
                }

                // const notification: Notification = {
                //     id: 0,
                //     type,
                //     content: agreeOrDisagree === "agree" ? "concorda com seu comentario" : "discorda do seu comentário",
                //     newsOrigen: {
                //         id: newsId || 0,
                //         title: ""
                //     },
                //     hasBeenRead: false,
                //     userTarget: {
                //         id: userTarget,
                //         name: ""
                //     },
                //     causedBy: {
                //         id: causedBy,
                //         name: ""
                //     }
                // }

                // await this.notificationRepository.save(notification);
                await connection.transaction("commit");
            } catch (error) {
                await connection.transaction("rollback");
                throw error;
            }

            await connection.closeConnection();
        } catch (error) {
            LogError(error, "model");
            throw error;
        }
    }

    public async delete(params: any): Promise<void> {

    }

    public async removeReaction(reaction: Reaction, agreeCount: number, disagreeCount: number, type: string): Promise<void> {
        try {
            const connection = new Connection();

            await connection.transaction("begin");

            try {
                if (type === "comment") {
                    await connection.query(`
                        DELETE FROM comments_reactions
                        WHERE caused_by = ? AND comment_id = ?
                    `, [reaction.causedBy, reaction.commentId]);

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, reaction.commentId);
                } else {
                    await connection.query(`
                        DELETE FROM answers_reactions
                        WHERE caused_by = ? AND answer_id = ?
                    `, [reaction.causedBy, reaction.commentId]);

                    await this.updateReactionCount(connection, agreeCount, disagreeCount, reaction.commentId, "answer");
                }

                await connection.transaction("commit");

                await connection.closeConnection();
            } catch (error) {
                await connection.transaction("rollback");
                throw error;
            }
            await connection.closeConnection();
        } catch (error) {
            LogError(error, "model");
            throw error;
        }
    }
}