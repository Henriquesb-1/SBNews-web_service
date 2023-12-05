import { author, reactions } from "../Types";
import Answer from "./Answer";
import User from "./User";

export default class Comment {
    readonly content: string;
    readonly datePosted: string;
    readonly newsId: number;
    readonly commentId: number;
    readonly author: author;
    readonly reactions: reactions;

    constructor(content: string, datePosted: string, newsId: number, commentId: number, author: author, reactions: reactions) {
        this.content = content;
        this.datePosted = datePosted;
        this.newsId = newsId;
        this.commentId = commentId;
        this.author = author;
        this.reactions = reactions;
    }
}