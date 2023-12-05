import { Request, Response } from "express";
import News from "../model/entities/News";
import NewsService from "../model/service/NewsService";
import LogError from "../model/utils/LogError";
import NewsRepository from "../model/repository/NewsRepository";


export default class NewsController {

    private newsRepository: NewsRepository;

    public constructor(newsService: NewsRepository = new NewsService()) {
        this.newsRepository = newsService;
    }

    public async save(req: Request, res: Response): Promise<void> {
        const news: News = { ...req.body }

        try {
            if (req.method === "POST") {
                await this.newsRepository.save(news);
                res.status(204).send();
            } else if (req.method === "PUT") {
                if (!news.id) throw new Error("ID is undefined");
                
                await this.newsRepository.update(news);
                res.status(204).send();
            }
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const newsId = req.params.id;

        try {
            await this.newsRepository.delete(newsId);
            res.status(204).send();
        } catch (error) {
            res.status(500).send();
        }
    }

    public async get(req: Request, res: Response): Promise<Response> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const filter = <string>req.query.filter || "all";

        try {
            const reject = () => res.status(400).send();

            if (filter === "all") {
                const { data, pages, total } = await this.newsRepository.get(page);
                return res.status(200).json({ data, pages, total });

            } else if (filter === "topNews") {
                const topNews = await this.newsRepository.getTopNews();
                return res.status(200).json(topNews);

            } else if (filter === "relatedNews") {
                const newsId = <string>req.query.newsId;
                const categoryId = <string>req.query.categoryId;

                if (!newsId || !categoryId) return reject();

                const relatedNews = await this.newsRepository.getRelatedNews(categoryId, newsId);
                return res.status(200).json(relatedNews);

            } else if (filter === "read") {
                const title = <string>req.query.title;

                if (!title) return reject();

                const newsToRead = await this.newsRepository.getReadContent(title);
                return res.status(200).json(newsToRead);

            } else if (filter === "author") {
                const id = <string>req.query.id;

                if (!id) return reject();

                const { data, pages, total } = await this.newsRepository.getNewsByAuthor(page, id);
                return res.status(200).json({ data, pages, total });

            } else if (filter === "category") {
                const name = <string>req.query.name;
                if (!name) return reject();

                const { data, pages, total } = await this.newsRepository.getNewsByCategory(page, name);
                return res.status(200).json({ data, pages, total });

            } else if (filter === "topNews") {
                const topNews = await this.newsRepository.getTopNews();
                return res.status(200).json(topNews);

            } else if(filter === "search") {
                const title = <string>req.query.title;
                if(!title) return reject();

                const { data, pages, total } = await this.newsRepository.getByTitle(title, page);
                return res.status(200).json({data, pages, total});

            } else if(filter === "titleAndAuthor") {
                const title = <string>req.query.title || "";
                const authorId = <string>req.query.authorId;

                if(!authorId) return reject();

                const { data, pages, total } = await this.newsRepository.getNewsByAuthorAndTitle(authorId, title, page);
                return res.status(200).json({data, pages, total});

            } else return res.status(400).send();

        } catch (error) {
            LogError(error);
            return res.status(500).send();
        }
    }

    public async getHidden(req: Request, res: Response) {
        try {
            const page = Number.parseInt(<string>req.query.page || "1");
            const title = <string>req.query.title || "";
            const authorId = <string>req.query.authorId;

            const { data, pages, total } = await this.newsRepository.getNewsNotVisible(authorId, title, page);

            res.status(200).json({data, pages, total});
        } catch (error) {
            res.status(500).send();
        }
    }
}