import { IMapKeyConfiguration, ISqliteDatabase } from './interfaces';
export interface IKeyCache {
    get(k: string): any;
    set(k: string, v: any, liveSession: number): any;
    reset(): void;
}
export interface IMapRecord {
    key: string;
    value: any;
    id: number;
}
/**
 * @class KeyPairTable
 */
export declare class MapTable {
    protected tableName: string;
    protected configuration: {
        [key: string]: IMapKeyConfiguration;
    };
    protected database: ISqliteDatabase;
    private _cache;
    constructor(tableName: string, configuration: {
        [key: string]: IMapKeyConfiguration;
    }, database: ISqliteDatabase, _cache: IKeyCache);
    /**
     * Inserts the given value for the given key.
     */
    insertP(key: string, value: any): PromiseLike<IMapRecord>;
    /**
     * Updtes the given reocrd; the record value has been updated.
     */
    updateP(record: IMapRecord, newValue: any): PromiseLike<IMapRecord>;
    /**
     * Returns the infomation about the given key.
     */
    getP(key: string): PromiseLike<IMapRecord>;
    /**
     * Cleans all database record.
     */
    resetP(): PromiseLike<any>;
}
