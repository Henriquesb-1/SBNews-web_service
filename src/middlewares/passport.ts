import { ExtractJwt, Strategy } from "passport-jwt";
import Connection from "../model/service/Connection";
import passport from "passport";

export default function authenticate() {
    const strategy = new Strategy({ secretOrKey: process.env.authSecret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() }, async (payload, done) => {
        const connection = new Connection();
        
        const user = await connection.query("SELECT id FROM users WHERE id = ?", [payload.id]);

        await connection.closeConnection();

        if (user) done(null, { ...payload });
        else done("", false);
    });

    passport.use(strategy);

    return passport.authenticate("jwt", { session: false });
}