import User from "./User";

interface category { id: number, name: string };

export default class News {
    readonly id: number;
    readonly title: string;
    readonly imageUrl: string;
    readonly description: string;
    readonly category: category;
    #dateCreated: string;
    readonly author: User;
    #content: string;
    private _isVisible: boolean;
    readonly clickCount: number;

    public constructor(id: number, title: string, imageUrl: string, description: string, category: category, dateCreated: string, author: User, content: string, isVisible: boolean) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.category = category;
        this.#dateCreated = dateCreated;
        this.author = author;
        this.#content = content;
        this._isVisible = isVisible;
        this.clickCount = 0;
    }

    get content() {
        return this.#content;
    }
    set content(content: string) {
        this.content = content;
    }

    get dateCreated(): string {
        return this.#dateCreated;
    }
    set dateCreated(dateCreated: string) {
        this.#dateCreated = dateCreated;
    }

    get isVisible() {
        return this._isVisible;
    }
    set isVisible(isVisible: boolean) {
        this._isVisible = isVisible;
    }
}