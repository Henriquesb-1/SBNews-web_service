import { Request, Response } from "express";
import AnswerService from "../model/service/AnswerService";
import Answer from "../model/entities/Answer";
import LogError from "../model/utils/LogError";
import AnswerRepository from "../model/repository/AnswerRepository";

export default class AnswerController {

    private answerRepository: AnswerRepository;

    public constructor(answerService: AnswerRepository = new AnswerService()) {
        this.answerRepository = answerService;
    }

    public async saveAnswer(req: Request, res: Response): Promise<void> {
        const answer: Answer = { ...req.body };

        try {
            if(!answer.content) throw "Conteudo não informado";
            
            if (req.method === "POST") {
                const saveAnswers = await this.answerRepository.save(answer);
                res.status(200).send(`${saveAnswers}`);
            } else if (req.method === "PUT") {
                if (!answer.answerId) throw "Answer id cannot be undefined";
                await this.answerRepository.update(answer);
                res.status(204).send();
            }
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send(error);
        }
    }

    public async getAnswers(req: Request, res: Response): Promise<void> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const commentId = Number.parseInt(<string>req.query.commentId);

        try {
            const { data } = await this.answerRepository.get(page, commentId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json();
        }
    }

    public async deleteAnswer(req: Request, res: Response): Promise<void> {
        const answerId = <string>req.params.answerId;

        try {
            await this.answerRepository.delete(answerId);
            res.status(204).send();
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }
}