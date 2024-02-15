import { NextFunction, Request, Response } from "express";
import UserType from "../model/entities/UserType";

export default function isAdmin(req: Request, res: Response, next: NextFunction) {
    const user = <{userType: UserType}> req.user;
    
    user.userType === UserType.ADMIN ? next() : res.status(401).send();
};