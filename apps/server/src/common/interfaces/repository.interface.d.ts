export interface IBaseRepository<T, ID = string> {
    findById(id: ID): Promise<T | null>;
    findAll(filter?: Record<string, any>): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: ID, data: Partial<T>): Promise<T>;
    delete(id: ID): Promise<boolean>;
}
//# sourceMappingURL=repository.interface.d.ts.map