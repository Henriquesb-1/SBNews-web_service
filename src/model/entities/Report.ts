interface author { id: number, name: string }
interface reported {
    id: number;
    name: string;
    userType?: string;
    mutedTime?: number;
    warnedTimes?: number;
    silencedTimes?: number;
    isBanned?: boolean;
}

export default class Report {
    readonly id: number;
    readonly type: string;
    readonly reason: string;
    readonly content: string;
    readonly newsOrigenId: number;
    readonly author: author;
    readonly reported: reported
    readonly commentTarget: number;
    readonly answerTarget: number;

    public constructor(id: number, type: string, content: string, reason: string, author: author, reported: reported, newsOrigenId: number, commentTarget: number, answerTarget: number) {
        this.id = id;
        this.type = type;
        this.reason = reason;
        this.content = content;
        this.author = author;
        this.reported = reported;
        this.newsOrigenId = newsOrigenId;
        this.commentTarget = commentTarget;
        this.answerTarget = answerTarget;
    }
}