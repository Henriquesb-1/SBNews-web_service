import Category from "./entities/Category";
import Comments from "./entities/Comment";
import News from "./entities/News";

export interface NewsReturnTypes {
    data: News[];
    total: number;
    pages: number;
}

export interface CategoryReturnTypes {
    data: Category[];
    total?: number;
    pages?: number;
}

export interface CommentReturnTypes {
    data: Comments[];
    total: number;
}

export interface author { 
    id: number;
    name: string;
    imageUrl?: string | undefined; 
}

export interface reactions { 
    agreeCount: number;
    disagreeCount: number; 
}