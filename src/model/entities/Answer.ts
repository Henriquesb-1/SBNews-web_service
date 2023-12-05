import { author, reactions } from "../Types";

export default class Answer {
    readonly content: string;
    readonly answerId: number;
    readonly commentId: number;
    readonly author: author;
    readonly datePosted: string;
    readonly reactions: reactions;
    readonly userTagged?: {
        id: number;
        name: string;
    }
    readonly newsId?: number;

    constructor(content: string, answerId: number, commentId: number, author: author, datePosted: string, reactions: reactions) {
        this.content = content;
        this.answerId = answerId;
        this.commentId = commentId;
        this.author = author;
        this.datePosted = datePosted;
        this.reactions = reactions;
    }
}