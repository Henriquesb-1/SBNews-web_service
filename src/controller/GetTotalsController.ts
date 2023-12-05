import { Request, Response } from "express";
import GetTotals from "../model/service/GetTotals";

export default async function GetTotalsController(req: Request, res: Response) {
    const type = <string>req.query.type;
    const param = <any>req.query.param;

    let total = 0;

    switch (type) {
        case "answer":
            total = await GetTotals.getAnswersTotal(param);
        break;

        case "comment":
            total = await GetTotals.getTotalComments(param);
        break;

        case "report":
            total = await GetTotals.getTotalReports(param);
        break;
    }

    res.status(200).json(total);
}