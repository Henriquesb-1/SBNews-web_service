import Comment from "../entities/Comment";
import CrudRepository from "./CrudRepository";

export default interface CommentRepository extends CrudRepository<Comment> {
    
}