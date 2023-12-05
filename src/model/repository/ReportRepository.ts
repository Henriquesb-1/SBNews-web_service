import Report from "../entities/Report";
import CrudRepository from "./CrudRepository";

export default interface ReportRepository extends CrudRepository<Report> {
    handleReport(report: Report, willDeleteContent: boolean, willPunishAuthor: boolean): Promise<string>;
}