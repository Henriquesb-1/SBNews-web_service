import Reaction from "../entities/Reaction";
import CrudRepository from "./CrudRepository";

export default interface ReactionRepository extends CrudRepository<Reaction> {
    getCommentAlreadyReacted(userId: string, type: string): Promise<Reaction[]>;
    removeReaction(reaction: Reaction, agreeCount: number, disagreeCount: number, type: string): Promise<void>;
}