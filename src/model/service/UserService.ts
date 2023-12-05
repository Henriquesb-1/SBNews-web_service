import User from "../entities/User";
import UserBuilder from "../entities/builders/UserBuilder";
import UserRepository from "../repository/UserRepository";
import Connection from "../utils/Connection";
import getNecessariesPages from "../utils/Paginator";
import renderDate from "../utils/parseDate";

export default class UserService implements UserRepository {

    private limit = 10;

    private fixDateAndReturnUsers(users: User[]): User[] {
        const now = Math.floor(Date.now() / 1000);

        return users.map(user => {
            user.joinIn = renderDate(user.joinIn);
            user.mutedTime = Math.floor((user.mutedTime - now) / 60 / 60 / 24);
            return user
        })
    }

    public async getTotal(id: number): Promise<number> {
        return 0;
    }

    public async save(user: User): Promise<any> {
        try {
            const connection = new Connection();

            await connection.query(`
                INSERT INTO users(name, email, password, image_url, join_in)
                VALUES(?, ?, ?, ?, ?)
            `, [user.name, user.email, user.password, user.imageUrl, user.joinIn]);

            await connection.closeConnection();
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    public async update(data: User): Promise<string> {
        const { userType, mutedTime, timesSilenced, warnedTimes, isBanned, id } = data;

        try {
            const connection = new Connection();

            const userModel = new UserBuilder()
                .addMutedTime(mutedTime)
                .addTimesSilenced(timesSilenced)
                .addWarnedTime(warnedTimes)
                .addIsBanned(isBanned)
                .buildUser();

            await connection.query(`
                UPDATE users
                SET user_type = ?, muted_time = ?, times_silenced = ?, warned_times = ?, isBanned = ?
                WHERE id = ?
            `, [userType, userModel.mutedTime, userModel.timesSilenced, userModel.warnedTimes, userModel.isBanned, id]);

            await connection.closeConnection();

            return userModel.feedBack;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async updateUserProfile(user: User): Promise<void> {
        const { name, email, imageUrl, newPassword, id }: User = user;

        try {
            const connection = new Connection();

            if (newPassword) {
                await connection.query(`
                    UPDATE users
                    SET name = ?, email = ?, password = ?, image_url = ?
                    WHERE id = ?
                `, [name, email, newPassword, imageUrl, id]);
            } else {
                await connection.query(`
                    UPDATE users
                    SET name = ?, email = ?, image_url = ?
                    WHERE id = ?
                `, [name, email, imageUrl, id]);
            }

            await connection.closeConnection();
        } catch (error) {
            throw error;
        }
    }

    public async userAlreadyExists(name: string): Promise<boolean> {
        try {
            const connection = new Connection();

            const userFromDb = <User[]>await connection.query("SELECT name FROM users WHERE name = ?", [name]);
            return userFromDb.length > 0;
        } catch (error) {
            throw error;
        }
    }

    public async getUserThatWillLog(userName: string): Promise<User> {
        try {
            const connection = new Connection();

            const userFromDb = <User[]>await connection.query(`
                SELECT id, name, email, password, image_url as imageUrl, user_type as userType, muted_time as mutedTime, times_silenced as timesSilenced, isBanned
                FROM users
                WHERE name = ?
            `, [userName]);

            await connection.closeConnection();

            const [user] = userFromDb.map((user: User) => user);
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async get(page: number, param: { type: string, onlyMuteds: boolean, onlyBanned: boolean, userName: string }): Promise<any> {
        const { type, onlyMuteds, onlyBanned, userName } = param;
        const now = Math.floor(Date.now() / 1000);
        
        try {
            const connection = new Connection;

            const totalUsers = await connection.query(`
                SELECT count(id) as total 
                FROM users
                WHERE user_type = ? 
                    AND ${onlyMuteds ? "muted_time > ?" : "muted_time = ?"} 
                    AND isBanned = ?  
                    AND name LIKE ?
            `, [type, onlyMuteds ? now : 0, onlyBanned, `%${userName}%`])

            let data = <User[]>await connection.query(`
                SELECT id, name, join_in as joinIn, muted_time as mutedTime, times_silenced as timesSilenced, warned_times as warnedTimes, user_type as userType, isBanned
                FROM users
                WHERE user_type = ? 
                    AND ${onlyMuteds ? "muted_time > ?" : "muted_time = ?"} 
                    AND isBanned = ? 
                    AND name LIKE ?
                LIMIT ? 
                OFFSET ?
            `, [type, onlyMuteds ? now : 0, onlyBanned, `%${userName}%`, this.limit, (page * this.limit - this.limit)]);

            await connection.closeConnection();

            const [total] = totalUsers.map((user: { total: number }) => user.total)

            const pages = getNecessariesPages(total, this.limit);

            return {
                data: this.fixDateAndReturnUsers(data),
                total,
                pages
            }
        } catch (error) {
            throw error;
        }
    }

    public async getUserProfile(name: string): Promise<{ user: User, commentsAgree: number, answersAgree: number }> {
        try {
            const connection = new Connection;

            const totalCommentsReactionsQuery = await connection.query(`
                SELECT commentsAgree.commentsAgree, answersAgree.answersAgree
                FROM (
                    SELECT COUNT(agree_or_disagree) as commentsAgree
                    FROM comments_reactions
                    WHERE 
                        agree_or_disagree = 'agree' 
                        AND user_target = (SELECT id FROM users WHERE name = ?)
                ) commentsAgree, (
                    SELECT COUNT(agree_or_disagree) as answersAgree
                    FROM answers_reactions
                    WHERE agree_or_disagree = 'agree' AND user_target = (SELECT id FROM users WHERE name = ?)
                ) answersAgree
            `, [name, name]);

            const userQuery = <User[]>await connection.query(`
                SELECT id, name, email, image_url as imageUrl, join_in as joinIn
                FROM users
                WHERE name = ?
            `, [name]);

            const [user] = userQuery.map(user => user);

            const [reactionsCount] = totalCommentsReactionsQuery.map((reactions: any) => reactions);
            const { commentsAgree, answersAgree } = reactionsCount;

            user.joinIn = renderDate(user.joinIn);

            return {
                user,
                commentsAgree,
                answersAgree
            };
        } catch (error) {
            throw error;
        }
    }

    public async getNewsAuthors(): Promise<User[]> {
        try {
            const connection = new Connection();

            const data = <User[]>await connection.query(`
                SELECT id, name
                FROM users
                WHERE user_type = 'news_creator'
            `);

            await connection.closeConnection();

            return data;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: string): Promise<void> {

    }

    public async getUserPassword(userId: number): Promise<string> {
        try {
            const connection = new Connection();

            const passwordQuery = await connection.query(`
                SELECT password
                FROM users
                WHERE id = ?
            `, [userId]);

            const [password] = passwordQuery.map((user: {password: string}) => user.password);
            
            await connection.closeConnection();

            return password;
        } catch (error) {
            throw error;
        }
    }
}