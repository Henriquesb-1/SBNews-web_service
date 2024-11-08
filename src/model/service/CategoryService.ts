import { CategoryReturnTypes } from "../Types";
import Category from "../entities/Category";
import User from "../entities/User";
import CategoryRepository from "../repository/CategoryRepository";
import Connection from "./Connection";
import getNecessariesPages from "../utils/Paginator";

export default class CategoryService implements CategoryRepository {

    private limit = 5;

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async save(data: Category): Promise<any> {
        const { name, parentId, createdBy } = data;

        try {
            const connection = new Connection();

            try {
                await connection.query(`
                    INSERT INTO category(name, parent_id, created_by)
                    VALUE(?, ?, ?)
                `, [name, parentId || null, createdBy]);

                await connection.closeConnection();
            } catch (error: any) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    public async update(data: any): Promise<any> {
        const { id, name, parentId } = data;

        try {
            const connection = new Connection();

            try {
                await connection.query(`
                    UPDATE category
                    SET name = ?, parent_id = ?
                    WHERE id = ?
                `, [name, parentId || null, id])

                await connection.closeConnection();
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async get(page: number): Promise<CategoryReturnTypes> {
        try {
            const connection = new Connection();

            try {
                const categoriesToSend = <Category[]>await connection.query(`SELECT id, name, parent_id as parentId FROM category`);
                await connection.closeConnection();

                return {
                    data: categoriesToSend
                }

            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    public async getCategoriesWithParent(userId: string): Promise<Category[]> {
        try {
            const connection = new Connection();

            const categories = <Category[]>await connection.query(`SELECT id, name, parent_id as parentId, created_by as createdBy, (SELECT COUNT(ID) FROM news WHERE category_id = category.id) as newsCount  FROM category WHERE created_by = ?`, [userId]);
            const allCategories = <Category[]>await connection.query("SELECT id, name, parent_id as parentId, created_by as createdBy FROM category");
            
            await connection.closeConnection();

            const categoryWithParent = categories.map((category: Category) => {
                const parentCategory = allCategories.filter(parentCategory => category.parentId == parentCategory.id);

                if (parentCategory[0]) return new Category(category.id, category.name, category.createdBy, category.parentId, parentCategory[0]);
                else return new Category(category.id, category.name, category.createdBy);
            });

            return categoryWithParent;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async delete(param: {id: string, userId: string}): Promise<string> {
        try {
            const connection = new Connection();

            try {
                const hasChildCategoryCreatedByOtherUser = <{createdBy: number}[]> await connection.query("SELECT created_by as createdBy FROM category WHERE parent_id = ? AND NOT created_by = ?", [param.id, param.userId]);
                const hasNewsRegister = <{total: number}[]> await connection.query("SELECT COUNT(id) as total FROM news WHERE category_id = ?", [param.id]);
                const [totalNewsRegister] = hasNewsRegister.map(news => news.total);
                const hasParentCategory = <{id: number, name: string}[]> await connection.query("SELECT id, name FROM category WHERE parent_id = ?", [param.id]);

                if(hasChildCategoryCreatedByOtherUser.length > 0) {
                    const usersUsingParentCategory = <User[]> await connection.query("SELECT name FROM users WHERE id IN (?)", [hasChildCategoryCreatedByOtherUser.map(childCategory => childCategory.createdBy)])
                    let userNames = "";

                    usersUsingParentCategory.forEach(user => userNames += user.name);
                    
                    return `Erro ao excluir categoria, usuarios ${userNames} estão usando está categoria como raiz`;
                } else if(totalNewsRegister > 0) {
                    return `Erro ao excluir categoria, essa categoria possui ${totalNewsRegister} notícias registradas.`;
                } else if(hasParentCategory.length > 0) {
                    let categoryNames = "";
                    hasParentCategory.forEach((category, index) => {
                        index < hasParentCategory.length ? categoryNames += category.name + ", " : categoryNames += category.name;
                    });

                    return `Erro ao excluir categoria, categorias ${categoryNames} estão usando está categoria como raiz.`
                } else {
                    await connection.query("DELETE FROM category WHERE id = ?", [param.id]);
                    return "";
                }
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }
}