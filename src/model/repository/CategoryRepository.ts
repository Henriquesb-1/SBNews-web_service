import Category from "../entities/Category";
import CrudRepository from "./CrudRepository";

export default interface CategoryRepository extends CrudRepository<Category> {
    delete(param: {id: string, userId: string}): Promise<string>;
    getCategoriesWithParent(userId: string): Promise<Category[]>;
}