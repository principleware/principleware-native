export interface ITableSchema {
    insert: string;
    create: string;
    remove: string;
    select: string;
}
export interface IMapKeyConfiguration {
    dbKey: string;
    cacheKey: string;
    defaultValue: any;
    parser: (value: any) => any;
}
export interface ISqliteDatabase {
    insertPromise(table: string, data: any): PromiseLike<number>;
    selectPromise(table: string, selectSql?: string): PromiseLike<any[]>;
    deletePromise(table: string, id: number, lastId?: number): PromiseLike<any>;
    deleteWherePromise(table: string, where: string): PromiseLike<any>;
    updatePromise(table: string, value: any, where: string): PromiseLike<any>;
}
