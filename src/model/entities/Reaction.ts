// export default class Reaction {
//     readonly agreeOrDisagree: string;
//     readonly causedBy: number;
//     readonly commentId: number;
//     readonly userTarget: number;

//     public constructor(agreeOrDisagree: string, causedBy: number, commentId: number, userTarget: number) {
//         this.agreeOrDisagree = agreeOrDisagree;
//         this.causedBy = causedBy;
//         this.commentId = commentId;
//         this.userTarget = userTarget;
//     }
// }

export default interface Reaction {
    readonly agreeOrDisagree: string;
    readonly causedBy: number;
    readonly commentId: number;
    readonly userTarget: number;
    readonly newsId?: number
}