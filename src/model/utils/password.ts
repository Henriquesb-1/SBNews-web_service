import bcript from "bcrypt";

export default abstract class Password {
    public static hashPassword(password: string) {
        const salt = bcript.genSaltSync(10);
        const encriptedPassword = bcript.hashSync(password, salt);
        return encriptedPassword;
    }

    public static isPasswordTheSame(password: string, repeatedPassword: string) {
        return password === repeatedPassword;
    }

    public static isPasswordCorrect(textPassword: string, hashedPassword: string) {
        const isMatch = bcript.compareSync(textPassword, hashedPassword);
        return isMatch;
    }
}