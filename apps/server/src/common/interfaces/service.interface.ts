export interface IBaseService<T, ID = string> {
  getById(id: ID): Promise<T>;
  getAll(filter?: Record<string, any>): Promise<T[]>;
  create(dto: any): Promise<T>;
  update(id: ID, dto: any): Promise<T>;
  delete(id: ID): Promise<boolean>;
}
