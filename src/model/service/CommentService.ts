import Comment from "../entities/Comment";
import CommentRepository from "../repository/CommentRepository";
import Connection from "../utils/Connection";
import renderDate from "../utils/parseDate";

export default class CommentService implements CommentRepository {

    private limit = 5;

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async save(data: Comment): Promise<void> {
        const { content, newsId, author, datePosted } = data;

        try {
            const connection = new Connection();

            try {
                await connection.query(`
                    INSERT INTO comments(content, news_id, author_id, date_posted)
                    VALUES (?, ?, ?, ?)
                `, [content, newsId, author.id, datePosted]);

                await connection.closeConnection();
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    public async update(data: Comment): Promise<void> {
        const { content } = data;

        try {
            const connection = new Connection();

            try {
                await connection.query(`
                    UPDATE comments
                    SET content = ?
                    WHERE id = ?
                `, [content, data.commentId]);

                await connection.closeConnection();
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    public async get(page: number, newsId: number): Promise<{data: Comment[]}> {
        try {
            const connection = new Connection();

            const commentsQuery = <Comment[]>await connection.query(`
                    SELECT 
                        comments.id as commentId, comments.content as content, comments.date_posted as datePosted, comments.agree_count as agreeCount, comments.disagree_count as disagreeCount,
                        users.id as authorId, users.name as authorName, users.image_url as authorAvatarUrl
                    FROM 
                        comments, users
                    WHERE 
                        comments.news_id = ? 
                        AND users.id = comments.author_id
                    ORDER BY comments.agree_count DESC
                    LIMIT ?
                    OFFSET ?
                `, [newsId, this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const comments = commentsQuery.map((comment: any) => {
                const author = { id: comment.authorId, name: comment.authorName, imageUrl: comment.authorAvatarUrl }
                const reactions = { agreeCount: comment.agreeCount, disagreeCount: comment.disagreeCount }
                return new Comment(comment.content, renderDate(comment.datePosted), comment.newsId, comment.commentId, author, reactions);
            })

            return { data: comments };
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const connection = new Connection();

            await connection.query(`DELETE FROM comments WHERE id = ?`, [id]);
            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }
}