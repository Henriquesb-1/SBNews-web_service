export default class Category {
    readonly id: number;
    readonly name: string;
    readonly createdBy: number;
    readonly parentId?: number;
    readonly newsCount?: number;
    readonly parentCategory?: Category;

    constructor(id: number, name: string, createdBy: number, parentId?: number, parentCategory?: Category, newsCount?: number) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.parentId = parentId;
        this.parentCategory = parentCategory;
        this.newsCount = newsCount
    };

    public static buildPath() {

    }
}

// export default interface Category {
//     readonly id: number;
//     readonly name: string;
//     readonly parentId?: number;
//     readonly createdBy: number;
//     readonly newsCount?: number;
//     readonly parentCategory?: Category;
// }