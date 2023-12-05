import User from "../User";

export default class UserBuilder {
    private id: number = 0;
    private name: string = "";
    private email: string = "";
    private userType: string = "";
    private imageUrl: string = "";
    private joinIn: string = "";
    private password: string = "";
    private mutedTime: number = 0;
    private timesSilenced: number = 0;
    private warnedTimes: number = 0;
    private isBanned: boolean = false;

    public addId(id: number): UserBuilder {
        this.id = id;
        return this;
    }


    public addName(name: string): UserBuilder {
        this.name = name;
        return this;
    }


    public addEmail(email: string): UserBuilder {
        this.email = email;
        return this;
    }


    public addUserType(userType: string): UserBuilder {
        this.userType = userType;
        return this;
    }

    public addImageUrl(imageUrl: string): UserBuilder {
        this.imageUrl = imageUrl;
        return this;
    }

    public addJoinIn(joinIn: string): UserBuilder {
        this.joinIn = joinIn;
        return this;
    }

    public addPassword(password: string): UserBuilder {
        this.password = password;
        return this;
    }

    public addMutedTime(mutedTime: number): UserBuilder {
        this.mutedTime = mutedTime;
        return this;
    }

    public addTimesSilenced(timesSilenced: number): UserBuilder {
        this.timesSilenced = timesSilenced;
        return this;
    }

    public addWarnedTime(warnedTimes: number): UserBuilder {
        this.warnedTimes = warnedTimes;
        return this;
    }

    public addIsBanned(isBanned: boolean): UserBuilder {
        this.isBanned = isBanned;
        return this;
    }

    public buildUser(): User {
        return new User(this.id, this.name, this.email, this.userType, this.imageUrl, this.joinIn, this.password, this.mutedTime, this.timesSilenced, this.warnedTimes, this.isBanned);
    }

    public static buildBlankUser() {
        const { id, name, email, userType, imageUrl, joinIn, password, mutedTime, timesSilenced, warnedTimes, isBanned } = new UserBuilder().buildUser();
        return new User(id, name, email, userType, imageUrl, joinIn, password, mutedTime, timesSilenced, warnedTimes, isBanned);
    }
}