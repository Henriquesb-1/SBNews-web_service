import Connection from "../utils/Connection";
import NewsRepository from "../repository/NewsRepository";
import News from "../entities/News";
import getNecessariesPages from "../utils/Paginator";
import renderDate from "../utils/parseDate";
import { NewsReturnTypes } from "../Types";

export default class NewsService implements NewsRepository {

    private limit = 5;

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async save(news: News): Promise<void> {
        const { title, description, content, author, category, imageUrl, dateCreated, isVisible } = news;

        try {
            const connection = new Connection();

            await connection.query(`
                    INSERT INTO news(title, description, content, user_id, category_id, image_url, date_create, isVisible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [title, description, content, author.id, category.id, imageUrl, dateCreated, isVisible])

            await connection.closeConnection();
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    public async update(news: News): Promise<any> {
        const { id, title, description, content, category, imageUrl, isVisible } = news;

        try {
            const connection = new Connection();

            await connection.query(`
                UPDATE news
                SET title = ?, description = ?, content = ?, category_id = ?, image_url = ?, isVisible = ?
                WHERE id = ?
            `, [title, description, content, category.id, imageUrl, isVisible, id])

            await connection.closeConnection();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async delete(id: string): Promise<any> {
        try {
            const connection = new Connection();

            await connection.transaction("begin");

            const date = new Date();

            try {
                // await connection.query("DELETE FROM news WHERE id = ?", [id]);
                await connection.query("UPDATE news SET deleted_at = ? WHERE id = ?", [`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`, id]);
                await connection.transaction("commit");
            } catch (error) {
                await connection.transaction("roolback");
                throw error;
            }

            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async get(page: number): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();

            const totalQuery = await connection.query("SELECT COUNT(id) as total FROM NEWS WHERE isVisible = true");

            const news = <News[]>await connection.query(`
                SELECT 
                    news.id, news.title, news.description, news.image_url as imageUrl,
                    category.name as category
                FROM news, category
                WHERE 
                    isVisible = true
                    AND category.id = news.category_id
                ORDER BY date_create DESC
                LIMIT ? 
                OFFSET ?
            `, [this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const [total] = totalQuery.map((news: { total: number }) => news.total)

            const pages = getNecessariesPages(total, this.limit);

            return {
                data: news,
                pages,
                total
            };
        } catch (error) {
            throw error;
        }
    }

    public async getReadContent(title: string): Promise<News> {
        try {
            const connection = new Connection();

            await connection.query(`
                UPDATE news 
                SET visits = news.visits + 1
                WHERE title = ?
            `, [title]);

            const newsQuery = <News[]>await connection.query(`
                SELECT 
                    news.id, news.title, news.image_url as imageUrl, news.date_create as dateCreated, news.content,
                    author.name as author
                FROM 
                    news,
                    users author
                WHERE 
                    news.title = ?
                    AND author.id = news.user_id
            `, [title]);

            await connection.closeConnection();

            const [news] = newsQuery.map(news => {
                news.content = news.content.toString();
                news.dateCreated = renderDate(news.dateCreated);
                return news;
            })

            return news;
        } catch (error) {
            throw error;
        }
    }

    public async getNewsByAuthor(page: any, authorId: string): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();
            const TotalNewsQuery = await connection.query("SELECT COUNT(id) as total FROM news WHERE isVisible = true AND user_id = ?", [authorId]);

            const newsByAuthor = <News[]>await connection.query(`
                SELECT  
                    news.id, news.title, news.image_url as imageUrl, news.description,
                    category.name as category
                FROM 
                    news, 
                    category
                WHERE 
                    isVisible = true
                    AND news.user_id = ? 
                    AND category.id = news.category_id

                ORDER BY date_create
                LIMIT ?
                OFFSET ?
            `, [authorId, this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const [total] = TotalNewsQuery.map((news: { total: number }) => news.total);
            const pages = getNecessariesPages(total, this.limit);

            return {
                data: newsByAuthor,
                total,
                pages
            }
        } catch (error) {
            throw error;
        };
    }

    public async getNewsByCategory(page: any, categoryName: string): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();

            const parentCategoriesIds = <{ id: number }[]>await connection.query(`
                WITH RECURSIVE subcategories (id) AS (
                    SELECT id FROM category where name = ?
                    UNION ALL
                    SELECT c.id FROM subcategories, category c
                    WHERE parent_id = subcategories.id
                )
                SELECT id from subcategories
            `, [categoryName]);

            const ids = parentCategoriesIds.map(category => category.id);

            if (parentCategoriesIds.length > 0) {
                const newsCount = await connection.query(`
                    SELECT COUNT(id) as Total
                    FROM news
                    WHERE 
                        isVisible = true
                        AND news.category_id IN (?)
                `, [ids.map(id => id)]);


                const newsByCategory = <News[]>await connection.query(`
                    SELECT 
                        news.id, news.title, news.image_url as imageUrl, news.description, 
                        category.name as category
                    FROM news, category
                    WHERE
                        isVisible = true
                        AND news.category_id IN (?) 
                        AND category.id = news.category_id
                    ORDER BY news.date_create
                    LIMIT ?
                    OFFSET ?
                `, [ids.map(id => id), this.limit, (page * this.limit - this.limit)]);

                await connection.closeConnection();

                const [total] = newsCount.map((news: any) => news.Total);

                const pages = getNecessariesPages(total, this.limit);

                return {
                    data: newsByCategory,
                    total,
                    pages
                }
            } else {
                throw new Error("No news founded");
            }
        } catch (error) {
            throw error;
        };
    }

    public async getTopNews(): Promise<News[]> {
        try {
            const connection = new Connection();

            const topNews = <News[]>await connection.query(`
                SELECT id, title, image_url as imageUrl
                FROM news 
                WHERE isVisible = true
                ORDER BY visits DESC
                LIMIT 5
            `);

            await connection.closeConnection();

            return topNews;
        } catch (error) {
            throw error;
        }
    }

    public async getRelatedNews(categoryId: string, newsId: string): Promise<News[]> {
        try {
            const connection = new Connection();

            const parentCategory = await connection.query(`SELECT parent_id FROM category WHERE id = ?`, [categoryId])
            const [parentCategoryId] = parentCategory.map((category: { parent_id: number }) => category.parent_id)

            const relatedNews = <News[]>await connection.query(`
                SELECT id, title, description, image_url as imageUrl
                FROM news
                WHERE 
                    isVisible = true
                    AND category_id = ?
                    OR category_id = ?
                    AND id NOT LIKE ?
                LIMIT 5
            `, [parentCategoryId, categoryId, newsId]);

            await connection.closeConnection();

            return relatedNews;
        } catch (error) {
            throw error;
        }
    }

    public async getByTitle(title: string, page: number): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();

            const newsCount = await connection.query("SELECT COUNT(id) as total FROM news WHERE isVisible = true AND title LIKE ?", [`%${title}%`])

            const newsByTitle = <News[]>await connection.query(`
                SELECT 
                    news.id, news.title, news.image_url as imageUrl, news.description, 
                    category.name as category
                FROM news, category
                WHERE 
                    isVisible = true
                    AND title LIKE ?
                    AND category.id = news.category_id
                LIMIT ?
                OFFSET ?
            `, [`%${title}%`, this.limit, page * this.limit - this.limit]);

            await connection.closeConnection();

            const [total] = newsCount.map((news: { total: number }) => news.total)
            const pages = getNecessariesPages(total, this.limit);

            return {
                data: newsByTitle,
                pages,
                total
            }
        } catch (error) {
            throw error;
        }
    }

    public async getNewsByAuthorAndTitle(authorId: string, title: string, page: number): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();

            const totalQuery = await connection.query("SELECT COUNT(id) as total FROM news WHERE isVisible = true AND title LIKE ? AND user_id = ?", [`%${title}%`, authorId]);
            const [total] = totalQuery.map((news: { total: number }) => news.total);

            let news = <any[]>await connection.query(`
                SELECT 
                    news.id, news.title, news.description, news.content, news.image_url as imageUrl, news.visits, news.isVisible,
                    category.id as categoryId
                FROM 
                    news, category
                WHERE
                    isVisible = true
                    AND category.id = news.category_id
                    AND title LIKE ?
                    AND user_id = ?
                LIMIT ?
                OFFSET ?
            `, [`%${title}%`, authorId, this.limit, (page * this.limit - this.limit)]);

            let totalComments: number[] = [];

            for (let newsA of news) {
                const totalCommentsQuery = await connection.query("SELECT COUNT(id) as total FROM comments WHERE news_id = ?", [newsA.id]);
                const [totalCommentsSimplify] = totalCommentsQuery.map((totalComments: any) => totalComments.total);

                totalComments.push(totalCommentsSimplify);
            }

            news = news.map((news, index) => {
                news.content = news.content.toString();
                news.isVisible = news.isVisible === 1 ? true : false;
                return {
                    ...news,
                    totalComments: totalComments[index]
                };
            });

            await connection.closeConnection();

            const pages = getNecessariesPages(total, this.limit);

            return {
                data: news,
                pages,
                total
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async getNewsNotVisible(authorId: string, title: string, page: number): Promise<NewsReturnTypes> {
        try {
            const connection = new Connection();

            const totalQuery = await connection.query("SELECT COUNT(id) as total FROM news WHERE isVisible = false AND title LIKE ? AND user_id = ?", [`%${title}%`, authorId]);
            const [total] = totalQuery.map((news: { total: number }) => news.total);

            let news = <any[]>await connection.query(`
                SELECT 
                    news.id, news.title, news.description, news.content, news.image_url as imageUrl, news.visits, news.isVisible,
                    category.id as categoryId
                FROM 
                    news, category
                WHERE
                    isVisible = false
                    AND category.id = news.category_id
                    AND title LIKE ?
                    AND user_id = ?
                LIMIT ?
                OFFSET ?
            `, [`%${title}%`, authorId, this.limit, (page * this.limit - this.limit)]);

            let totalComments: number[] = [];

            for (let newsA of news) {
                const totalCommentsQuery = await connection.query("SELECT COUNT(id) as total FROM comments WHERE news_id = ?", [newsA.id]);
                const [totalCommentsSimplify] = totalCommentsQuery.map((totalComments: any) => totalComments.total);

                totalComments.push(totalCommentsSimplify);
            }

            news = news.map((news, index) => {
                news.content = news.content.toString();
                news.isVisible = news.isVisible === 1 ? true : false;
                return {
                    ...news,
                    totalComments: totalComments[index]
                };
            });

            await connection.closeConnection();

            const pages = getNecessariesPages(total, this.limit);

            return {
                data: news,
                pages,
                total
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}