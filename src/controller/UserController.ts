import { Request, Response } from "express";
import UserService from "../model/service/UserService";
import LogError from "../model/utils/LogError";
import User from "../model/entities/User";
import Password from "../model/utils/password";
import Auth from "../model/utils/Auth";
import UserRepository from "../model/repository/UserRepository";

export default class UserController {

    private userRepository: UserRepository;

    public constructor(userService: UserRepository = new UserService()) {
        this.userRepository = userService;
    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const userName = <string>req.query.userName || "";
        const type = <string>req.query.type || "normal";
        const onlyMuteds = !!req.query.muted;
        const onlyBanned = !!req.query.banned;
        
        try {
            const { data, pages, total } = await this.userRepository.get(page, { type, onlyMuteds, onlyBanned, userName });
            res.status(200).json({ data, pages, total });
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async getNewsAuthors(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.userRepository.getNewsAuthors();
            res.status(200).json(data);
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async saveUser(req: Request, res: Response): Promise<Response> {
        const user: User = { ...req.body };

        try {
            const userAlreadyExists = await this.userRepository.userAlreadyExists(user.name);

            if (!user.name || !user.email || !user.password || !user.confirmPassword) {
                return res.status(400).send("Nome/email/senha/repetição de senha não informados");
            } else if (!Password.isPasswordTheSame(user.password, user.confirmPassword || "")) {
                return res.status(400).send("Senhas não conferem");
            } else if (userAlreadyExists) {
                return res.status(400).send("Usuário ja cadastrado");
            } else {
                user.password = Password.hashPassword(user.password);
                await this.userRepository.save(user);
                return res.status(204).send();
            }
        } catch (error) {
            return res.status(500).send();
        }
    }

    public async updateUser(req: Request, res: Response): Promise<void> {
        const user: User = { ...req.body };

        try {
            const updateUserAndReceiveFeedback = await this.userRepository.update(user);
            res.status(200).send(updateUserAndReceiveFeedback);
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }

    public async updateUserProfile(req: Request, res: Response): Promise<Response> {
        const user: User = { ...req.body };

        try {
            const password = await this.userRepository.getUserPassword(user.id);

            if (!user.password || !user.name || !user.email || !user.id) {
                return res.status(401).send("Nome/email/Senha não informada");
            } else if (!Password.isPasswordCorrect(user.password, password)) {
                return res.status(401).send("Senha incorreta");
            }

            if (user.newPassword) {
                if (Password.isPasswordTheSame(user.newPassword, user.confirmPassword)) {
                    user.newPassword = Password.hashPassword(user.newPassword);
                } else {
                    return res.status(400).send("Novas senhas não conferem");
                }
            }

            await this.userRepository.updateUserProfile(user);

            return res.status(204).send();
        } catch (error) {
            LogError(error);
            return res.status(500).send();
        }
    }

    public async logUser(req: Request, res: Response): Promise<Response> {
        const user: User = { ...req.body }

        try {
            if (!user.name || !user.password) return res.status(400).send("Nome/senha não informado");

            const userFromDb = await this.userRepository.getUserThatWillLog(user.name);
            
            if (!userFromDb) return res.status(400).send("Usuário inválido ou não cadastrado");

            if (!Password.isPasswordCorrect(user.password, userFromDb.password)) return res.status(400).send("Senha incorreta");

            const token = Auth.genUserSecuriteToken(userFromDb);

            return res.status(200).send(token);
        } catch (error) {
            LogError(error);
            return res.status(500).send();
        }
    }

    public async getUserLogged(req: Request, res: Response): Promise<void> {
        res.status(200).json(req.user);
    }

    public async getNewsManagers(req: Request, res: Response): Promise<void> {
        try {
            const users = <User[]>await this.userRepository.getNewsAuthors();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send();
        }
    }

    public async getUserProfile(req: Request, res: Response): Promise<void> {
        const name = <string>req.query.name;

        try {
            const { user, commentsAgree, answersAgree } = await this.userRepository.getUserProfile(name);
            res.status(200).json({ user, commentsAgree, answersAgree });
        } catch (error) {
            LogError(error);
            res.status(500).send();
        }
    }
}