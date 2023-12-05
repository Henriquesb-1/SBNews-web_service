import { Request, Response } from "express";
import ReactionService from "../model/service/ReactionService";
import Reaction from "../model/entities/Reaction";
import LogError from "../model/utils/LogError";
import ReactionRepository from "../model/repository/ReactionRepository";

export default class ReactionController {

    private reactionRepository: ReactionRepository;

    public constructor(reactionService: ReactionRepository = new ReactionService()) {
        this.reactionRepository = reactionService;
    }

    public async getCommentAlreadyReact(req: Request, res: Response) {
        const userId = <string>req.query.userId;
        const type = <string>req.query.type || "comment";

        try {
            const commentAlreadyReacted = await this.reactionRepository.getCommentAlreadyReacted(userId, type);
            res.status(200).json(commentAlreadyReacted);
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }

    public async handleReaction(req: Request, res: Response): Promise<void> {
        interface reqBody {
            reaction: Reaction,
            agreeCount: number,
            disagreeCount: number,
            type: string,
            willRemoveReaction: boolean,
            willChangeReaction: boolean
        };

        const { reaction, agreeCount, disagreeCount, type, willRemoveReaction, willChangeReaction }: reqBody = { ...req.body };
        console.log(reaction)
        try {
            if(willRemoveReaction) await this.reactionRepository.removeReaction(reaction, agreeCount, disagreeCount, type);
            else if(willChangeReaction) await this.reactionRepository.update(reaction, { type, agreeCount, disagreeCount });
            else await this.reactionRepository.save(reaction, {type, agreeCount, disagreeCount});
            
            res.status(204).send();
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }
}