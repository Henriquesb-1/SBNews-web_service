import { NextFunction, Request, Response } from "express";
import Auth from "../model/utils/Auth";

interface User {
    id: number;
    name: string;
    imageUrl: string;
    userType: string;
    isMuted: boolean;
    exp: number;
};

export default function validateToken(req: Request, res: Response, next: NextFunction) {
    const user = <User> req.user;
    const isTokenValid = Auth.validateToken(user.exp);

    isTokenValid ? next() : res.status(401).send();
};