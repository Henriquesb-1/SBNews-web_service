import { Request, Response } from "express";
import CategoryService from "../model/service/CategoryService";
import Category from "../model/entities/Category";
import LogError from "../model/utils/LogError";
import CategoryRepository from "../model/repository/CategoryRepository";

export default class CategoryController {

    private categoryRepository: CategoryRepository;

    public constructor(categoryService: CategoryRepository = new CategoryService()) {
        this.categoryRepository = categoryService;
    }

    public async save(req: Request, res: Response): Promise<void> {
        const category: Category = { ...req.body }

        try {
            if (req.method === "POST") {
                await this.categoryRepository.save(category);
                console.log(category);
                res.status(204).send();
            } else if (req.method === "PUT") {
                if(!category.id) throw new Error("Id cannot be undefined");
                await this.categoryRepository.update(category);
                res.status(204).send();
            }
        } catch (error: any) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }

    public async getCategories(req: Request, res: Response): Promise<Response> {
        const page = Number.parseInt(<string>req.query.page || "1");
        const withoutPagination = !!req.query.withoutPagination;
        const withParent = !!req.query.withParent;
        
        try {
            if (withoutPagination) {
                const { data } = await this.categoryRepository.get(page);
                return res.status(200).json(data);
            } else if(withParent) {
                const userId = <string>req.query.userId;
                if(!userId) return res.status(400).send("User id was not informed");

                const categories = await this.categoryRepository.getCategoriesWithParent(userId);
                return res.status(200).json(categories);
            }
        } catch (error) {
            console.log(error);
            LogError(error, "controller");
            return res.status(500).send();
        }

        return res.status(500).send();
    }

    public async deleteCategory(req: Request, res: Response): Promise<void> {
        const id = <string>req.params.id;
        const userId = <string>req.params.userId;

        try {
            const userNames = await this.categoryRepository.delete({id, userId});

            if(userNames) {
                res.status(500).send(`Erro ao excluir categoria, usuarios ${userNames} estão usando está categoria como raiz`);
            } else {
                res.status(204).send();
            }
        } catch (error) {
            LogError(error, "controller");
            res.status(500).send();
        }
    }
}