import User from "../entities/User";
import CrudRepository from "./CrudRepository";

export default interface UserRepository extends CrudRepository<User> {
    getUserProfile(userName: string): Promise<{user: User, commentsAgree: number, answersAgree: number}>;
    getNewsAuthors(): Promise<User[]>;
    getUserThatWillLog(name: string): Promise<User>;
    userAlreadyExists(name: string): Promise<boolean>;
    updateUserProfile(user: User): Promise<void>;
    getUserPassword(userId: number): Promise<string>;
}