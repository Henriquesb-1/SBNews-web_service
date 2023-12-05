import { Request, Response } from "express";
import CommentService from "../model/service/CommentService";
import Comments from "../model/entities/Comment";
import LogError from "../model/utils/LogError";
import CommentRepository from "../model/repository/CommentRepository";

export default class CommentController {

    private commentRepository: CommentRepository;

    public constructor(commentService: CommentRepository = new CommentService()) {
        this.commentRepository = commentService;
    }

    public async saveComment(req: Request, res: Response): Promise<void> {
        const comment: Comments = { ...req.body }

        try {
            if (req.method === "POST") {
                await this.commentRepository.save(comment);
                res.status(204).send();
            } else if(req.method === "PUT") {
                if(!comment.commentId) throw "Comment id cannot be undefined"; 
                await this.commentRepository.update(comment);
                res.status(204).send();
            }
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async getComments(req: Request, res: Response): Promise<void> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const newsId = Number.parseInt(<string>req.query.newsId);

        try {
            const { data } = await this.commentRepository.get(page, newsId);
            res.status(200).json(data);
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async deleteComment(req: Request, res: Response): Promise<void> {
        const commentId = <string> req.params.commentId;

        try {
            await this.commentRepository.delete(commentId);
            res.status(204).send();
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }
}