import { describe, expect, test } from "@jest/globals";
import UserBuilder from "../model/entities/builders/UserBuilder";
import User from "../model/entities/User";
import AdminConfig from "../model/entities/AdminConfig";

import fs from "fs";
import path from "path";

const { timesCanBeWarned, timesCanBeSilenced, defaultSilencedDays }: AdminConfig = JSON.parse(fs.readFileSync(path.resolve() + "/src/.adminConfig.json").toString());

describe("User Module",  () => test(`User should be banned after be silenced ${timesCanBeSilenced} times`, () => {
    const user: User = new UserBuilder()
        .addTimesSilenced(4)
        .buildUser();

    user.silenceUser();

    expect(user.isBanned).toBe(true);
}));

describe("User Module",  () => test(`User should be silenced for ${defaultSilencedDays} days after be warned ${timesCanBeWarned} times`, () => {
    const now = Math.floor(Date.now() / 1000);
    const timeShouldBeSilenced = now + (60 * 60 * 24 * defaultSilencedDays); // 7 Days

    const user: User = new UserBuilder()
        .addWarnedTime(4)
        .buildUser();

    user.advertUser();

    expect(user.mutedTime).toBe(timeShouldBeSilenced);
}));

describe("User Module",  () => test(`Feedback should return "Usuário havia sido advertido mais de ${timesCanBeWarned} vezes e teve sua conta silenciada"`, () => {
    const user: User = new UserBuilder()
        .addWarnedTime(5)
        .buildUser();

    user.advertUser();
    user.mutedTime; //Must be called to update feedback

    expect(user.feedBack).toBe(`Usuário havia sido advertido mais de ${timesCanBeWarned} vezes e teve sua conta silenciada`);
}));

describe("User Module",  () => test(`Feedback should return "Usuário havia sido silenciado mais de ${timesCanBeSilenced} vezes e teve sua conta banida"`, () => {
    const user: User = new UserBuilder()
        .addTimesSilenced(5)
        .buildUser();

    user.silenceUser();
    user.isBanned; //Must be called to update feedback

    expect(user.feedBack).toBe(`Usuário havia sido silenciado mais de ${timesCanBeSilenced} vezes e teve sua conta banida`);
}));

describe("User Module",  () => test(`Feedback should return "Usuário havia sido silenciado mais de ${timesCanBeSilenced} vezes e teve sua conta banida"`, () => {
    const user: User = new UserBuilder()
        .addTimesSilenced(5)
        .buildUser();

    user.silenceUser();
    user.isBanned; //Must be called to update feedback

    expect(user.feedBack).toBe(`Usuário havia sido silenciado mais de ${timesCanBeSilenced} vezes e teve sua conta banida`);
}));