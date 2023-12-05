import { Application } from "express";
import NewsController from "./controller/NewsController";
import CommentController from "./controller/CommentController";
import AnswerController from "./controller/AnswerController";
import CategoryController from "./controller/CategoryController";
import UserController from "./controller/UserController";
import authenticate from "./middlewares/passport";
import Upload from "./middlewares/Upload";
import NotificationController from "./controller/NotificationController";
import AdminConfig from "./controller/AdminController";
import isAdmin from "./middlewares/isAdmin";
import StatsController from "./controller/StatsController";
import ReactionController from "./controller/ReactionController";
import ReportController from "./controller/ReportController";
import GetTotalsController from "./controller/GetTotalsController";

export default class Routes {

    private app: Application;

    public constructor(app: Application) {
        this.app = app;
    }

    private newsRoute(): void {
        const app = this.app;
        const newsRest = new NewsController();

        app.route("/news")
            .get((req, res) => newsRest.get(req, res))
            .all(authenticate())
            .post((req, res) => newsRest.save(req, res))
            .put((req, res) => newsRest.save(req, res));

        app.route("/news/hidden")
            .all(authenticate())
            .get((req, res) => newsRest.getHidden(req, res))

        app.delete("/news/:id", (req, res) => newsRest.delete(req, res));
    }

    private commentsRoute(): void {
        const app = this.app;

        const commentRest: CommentController = new CommentController();
        const answerRest: AnswerController = new AnswerController();
        const reactionRest = new ReactionController();

        app.route("/comments")
            .get((req, res) => commentRest.getComments(req, res))
            .all(authenticate())
            .post((req, res) => commentRest.saveComment(req, res))
            .put((req, res) => commentRest.saveComment(req, res));

        app.delete("/comments/:commentId", (req, res) => commentRest.deleteComment(req, res));

        app.route("/answers")
            .get((req, res) => answerRest.getAnswers(req, res))
            .all(authenticate())
            .post((req, res) => answerRest.saveAnswer(req, res))
            .put((req, res) => answerRest.saveAnswer(req, res));

        app.delete("/answers/:answerId", (req, res) => answerRest.deleteAnswer(req, res));

        app.route("/reactions")
            .all(authenticate())
            .get((req, res) => reactionRest.getCommentAlreadyReact(req, res))
            .all(authenticate())
            .post((req, res) => reactionRest.handleReaction(req, res));

    }

    private categoriesRoute(): void {
        const app = this.app;

        const categoryRest: CategoryController = new CategoryController();

        app.route("/category")
            .get((req, res) => categoryRest.getCategories(req, res))
            .all(authenticate())
            .post((req, res) => categoryRest.save(req, res))
            .put((req, res) => categoryRest.save(req, res));

        app.route("/category/:id/:userId")
            .all(authenticate())
            .delete((req, res) => categoryRest.deleteCategory(req, res));
    }

    private userRoute(): void {
        const app = this.app;

        const userRest: UserController = new UserController();
        const adminRest: AdminConfig = new AdminConfig();

        app.route("/users")
            .post(Upload("/upload/userAvatar").single("userImage"), (req, res) => userRest.saveUser(req, res))
            .all(authenticate())
            .all((req, res, next) => isAdmin(req, res, next))
            .get((req, res) => userRest.getUsers(req, res))
            .put((req, res) => userRest.updateUser(req, res));

        app.get("/users/newsAuthors", (req, res) => userRest.getNewsAuthors(req, res))

        app.route("/users/profile")
            .get((req, res) => { userRest.getUserProfile(req, res) })
            .all(authenticate())
            .post((req, res) => userRest.updateUserProfile(req, res));

        app.route("/users/auth")
            .post((req, res) => userRest.logUser(req, res))
            .all(authenticate())
            .get((req, res) => userRest.getUserLogged(req, res));

        app.route("/admin/config")
            .all(authenticate())
            .get((req, res) => adminRest.getAdminConfig(req, res))
            .put((req, res) => adminRest.changeAdminConfig(req, res));
    }

    private notificationRoute(): void {
        const app = this.app;

        const notificationRest = new NotificationController();

        app.route("/notification")
            .all(authenticate())
            .get((req, res) => notificationRest.getNotifications(req, res))
            .post((req, res) => notificationRest.saveNotification(req, res))
            .put((req, res) => notificationRest.setNotificationRead(req, res));

        app.route("/notification/unread/:userId")
            .all(authenticate())
            .get((req, res) => notificationRest.getUnreadNotificationCount(req, res));

        app.delete("/notification/:id", (req, res) => notificationRest.deleteNotification(req, res));
    }

    private statsRoute(): void {
        const app = this.app;

        const statsRest = new StatsController();

        app.route("/stats/admin")
            .all(authenticate())
            .get((req, res) => statsRest.getTotalUsers(req, res));

        app.route("/stats/newsManager")
            .all(authenticate())
            .get((req, res) => statsRest.getNewsStats(req, res));
    }

    private uploadRoute(): void {
        const app = this.app;

        app.post("/users/upload", Upload("/upload/userAvatar").single("userImage"), (req, res) => res.status(204).send());
        app.post("/news/upload", Upload("/upload/news/cover").single("news-cover"), (req, res) => res.status(204).send());
    }

    private report(): void {
        const app = this.app;

        const reportRest = new ReportController();

        app.route("/report")
            .all(authenticate())
            .post((req, res) => reportRest.saveReport(req, res))
            .all((req, res, next) => isAdmin(req, res, next))
            .get((req, res) => reportRest.getReports(req, res))
            .put((req, res) => reportRest.handleReport(req, res));
    }

    public createRoutes(): void {
        this.newsRoute();
        this.commentsRoute();
        this.categoriesRoute();
        this.userRoute();
        this.notificationRoute();
        this.uploadRoute();
        this.statsRoute();
        this.report();
        this.app.get("/total", (req, res) => GetTotalsController(req, res))
    }
}