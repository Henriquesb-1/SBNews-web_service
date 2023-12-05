import { NextFunction, Request, Response } from "express";

export default function isAdmin(req: Request, res: Response, next: NextFunction) {
    const user = <{userType: string}> req.user;
    
    user.userType === "admin" ? next() : res.status(401).send();
};