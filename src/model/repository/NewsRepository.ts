import News from "../entities/News";
import CrudRepository from "./CrudRepository";
import { NewsReturnTypes } from "../Types";

export default interface NewsRepository extends CrudRepository<News> {
    getReadContent(title: string): Promise<News>;
    getNewsByAuthor(page: any, authorId: string): Promise<NewsReturnTypes>;
    getNewsByCategory(page: any, categoryName: string): Promise<NewsReturnTypes>;
    getTopNews(): Promise<News[]>;
    getRelatedNews(categoryId: string, newsId: string): Promise<News[]>;
    getByTitle(title: string, page: number): Promise<NewsReturnTypes>;
    getNewsByAuthorAndTitle(authorId: string, title: string, page: number): Promise<NewsReturnTypes>;
    getNewsNotVisible(authorId: string, title: string, page: number): Promise<NewsReturnTypes>;
}