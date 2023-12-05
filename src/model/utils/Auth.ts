import jwt from "jwt-simple";
import User from "../entities/User";

export default class Auth {

    public static genUserSecuriteToken(user: User) {
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            id: user.id,
            name: user.name,
            imageUrl: user.imageUrl,
            userType: user.userType,
            isMuted: user.mutedTime > now,
            exp: now + (60 * 60 * 24 * 3) //3 Dias;
        };

        const authSecret = process.env.authSecret || "";

        return jwt.encode(payload, authSecret);
    }

    public static validateToken(exp: number) {
        return new Date(exp * 1000) > new Date();
    }
}