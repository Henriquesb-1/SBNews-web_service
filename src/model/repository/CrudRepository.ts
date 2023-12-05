export default interface CrudRepository<T> {
    get(page: number, param?: any): Promise<{data: T[], total?: number, pages?: number}>;
    save(data: T, params?: any): Promise<any>;
    update(data: T, params?: any): Promise<any>;
    delete(params: any): Promise<any>;
    getTotal(id: number): Promise<number>;
}
