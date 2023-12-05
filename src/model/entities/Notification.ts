interface user { id: number, name: string }

// export default class Notification {
//     readonly id: number;
//     readonly type: string;
//     readonly content: string;
//     readonly newsOrigen: number;
//     readonly hasBeenRead: boolean;
//     readonly userTarget: user;
//     readonly causedBy: user;

//     constructor(id: number, type: string, content: string, newsOrigen: number, hasBeenRead: boolean, userTarget: user, causedBy: user) {
//         this.id = id;
//         this.type = type;
//         this.content = content;
//         this.newsOrigen = newsOrigen;
//         this.hasBeenRead = hasBeenRead;
//         this.userTarget = userTarget;
//         this.causedBy = causedBy;
//     }
// }

export default interface Notification {
    readonly id: number;
    readonly type: string;
    readonly content: string;
    readonly newsOrigen: {
        id: number;
        title: string
    };
    readonly hasBeenRead: boolean;
    readonly userTarget: user;
    readonly causedBy: user;
}