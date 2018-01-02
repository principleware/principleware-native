/**
 * @fileOverview
 * Defines a Sqlite databse
 * @name SqliteDatabase.js
 * @module hypercom/storage/SqliteDatabase
 * @author Xiaolong Tang <xxlongtang@gmail.com>
 * @license Copyright @me
 */
import { SQLite } from '@ionic-native/sqlite';
import { IDevicePlatform } from '../platform/interfaces';
import { ITableSchema, ISqliteDatabase } from './interfaces';
export declare class SqliteDatabase implements ISqliteDatabase {
    private sqlite;
    private dbName;
    private dbSchema;
    private platform;
    constructor(sqlite: SQLite, dbName: string, dbSchema: {
        [key: string]: ITableSchema;
    }, platform: IDevicePlatform);
    /**
     * Inits a database.
     */
    initDBPromise(): PromiseLike<any>;
    deleteDBPromise(): PromiseLike<any>;
    /**
     * Closes the database.
     */
    closeDBPromise(): PromiseLike<any>;
    /**
     * Inserts data into the given table.
     */
    insertPromise(table: string, data: any): PromiseLike<number>;
    /**
     * Selects from the given table.
     */
    selectPromise(table: string, selectSql?: string): PromiseLike<any[]>;
    /**
     * Deletes records with the given id or range
     */
    deletePromise(table: string, id: number, lastId?: number): PromiseLike<any>;
    /**
     * Deletes records with the given where condition
     */
    deleteWherePromise(table: string, where: string): PromiseLike<any>;
    /**
     * Updates the given with the given value.
     */
    updatePromise(table: string, value: any, where?: string): PromiseLike<any>;
}
