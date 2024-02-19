import AdminConfig from "./AdminConfig";

import fs from "fs";
import path from "path";
import UserType from "./UserType";

const adminConfig: AdminConfig = JSON.parse(fs.readFileSync(path.resolve() + "/src/.adminConfig.json").toString());
const now = Math.floor(Date.now() / 1000);

export default class User {
    readonly id: number = 0;
    readonly name: string = "";
    readonly email: string = "";
    readonly userType: UserType = UserType.NORMAL;

    private _avatar: string = "";
    private _joinIn: string = "";
    private _password: string = "";
    private _mutedTime: number;
    private _timesSilenced: number;
    private _warnedTimes: number;
    private _isBanned: boolean;

    readonly confirmPassword: string = "";
    newPassword: string = "";
    readonly newsCreated: number = 0;

    private _feedBack = "";

    constructor(id: number, name: string, email: string, userType: UserType, avatar: string, joinIn: string, password: string, mutedTime: number, timesSilenced: number, warnedTimes: number, isBanned: boolean) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.userType = userType;
        this._avatar = avatar;
        this._joinIn = joinIn;
        this._password = password;
        this._mutedTime = mutedTime;
        this._timesSilenced = timesSilenced;
        this._warnedTimes = warnedTimes;
        this._isBanned = isBanned;
    }

    get joinIn() {
        return this._joinIn || "";
    }
    set joinIn(joinIn: string) {
        this._joinIn = joinIn;
    }

    get mutedTime() {
        if (this._warnedTimes >= adminConfig.timesCanBeWarned && this._timesSilenced < adminConfig.timesCanBeSilenced) {
            //if user had been warned more than the default time will be silenced;
            const defaultSilencedDays = adminConfig.defaultSilencedDays;
            this._feedBack = `Usuário havia sido advertido mais de ${adminConfig.timesCanBeWarned} vezes e teve sua conta silenciada`;

            return now + (60 * 60 * 24 * defaultSilencedDays);
        } else if (this._timesSilenced >= adminConfig.timesCanBeSilenced) {
            /*
                if an admin wants to silence a user and this user have been silenced more than he could, 
                will restore the "muted_time" to 0 in database and ban the user account;
            */
            return 0;
        } else if (this._mutedTime > now) {
            this._feedBack = "Usuario já havia sido silenciado";
            return this._mutedTime;
        } else {
            return this._mutedTime;
        };
    };
    set mutedTime(muted: number) {
        this._mutedTime = muted;
    }

    get timesSilenced() {
        if (this._timesSilenced >= adminConfig.timesCanBeSilenced) {
            //if user has been silenced more than he could, the "times_silenced" column register in database will rollback to 0;
            return 0;
        } else if (this._warnedTimes >= adminConfig.timesCanBeWarned) {
            return this._timesSilenced + 1;
        } else {
            return this._timesSilenced;
        };
    };

    get warnedTimes() {
        if (this._warnedTimes >= adminConfig.timesCanBeWarned) {
            /*
                if and admin warn a user more than he could be warned, 
                will restore the "warned_time" to 0 and silence user for the default time informed in ".adminConfig.json";
            */
            return 0;
        } else {
            return this._warnedTimes;
        };
    };

    get isBanned() {
        if (this._timesSilenced >= adminConfig.timesCanBeSilenced) {
            /*
                if a user was silenced more than he could be, 
                will set the isBanned register to 1(true) in database;
            */
            this._feedBack = `Usuário havia sido silenciado mais de ${adminConfig.timesCanBeSilenced} vezes e teve sua conta banida`;
            return true;
        } else if (typeof this._isBanned === "number") {
            return this._isBanned === 0 ? false : true
        } else {
            return this._isBanned;
        };
    };
    set isBanned(isBanned: boolean) {
        this._isBanned = isBanned;
    };

    get feedBack() {
        return this._feedBack;
    }

    get password() {
        return this._password || "";
    }
    set password(password: string) {
        this._password = password;
    }

    get avatar() {
        return this._avatar || "";
    }

    set avatar(avatar: string) {
        this._avatar = avatar;
    }

    public advertUser(): void {
        this._warnedTimes = this._warnedTimes + 1;
    }

    public silenceUser(days: number = 7) {
        this._mutedTime = now + (60 * 60 * 24 * days);
        this._timesSilenced = this._timesSilenced + 1;
    }
}