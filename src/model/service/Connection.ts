import mySql, { RowDataPacket } from "mysql2/promise";
import TransactionStatus from "./TransationStatus";

export default class Connection {
    #connection: Promise<mySql.Connection>;
    private _isInUse: boolean;

    public constructor(isInUse: boolean = true) {
       this.#connection = this.openConnection();
       this._isInUse = isInUse;
    }

    private openConnection(): Promise<mySql.Connection> {
        const user = process.env.DB_user;
        const password = process.env.DB_password;
        const database = process.env.DB_database;
        const host = process.env.DB_host;

        return mySql.createConnection({ user, password, database, host });
    }

    public get isInUse(): boolean {
        return this._isInUse;
    }

    public set isInUse(isInUse: boolean) {
        this._isInUse = isInUse;
    }

    public async query(sql: string, params?: any[]) {
        try {
            const [result] = <RowDataPacket[]> await (await this.#connection).query(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async transaction(status: TransactionStatus) {
        switch (status) {
            case TransactionStatus.BEGIN:
                (await this.#connection).beginTransaction();
            break;

            case TransactionStatus.COMMIT:
                (await this.#connection).commit();
            break;

            case TransactionStatus.ROLLBACK:
                (await this.#connection).rollback();
            break;
        
            default:
                throw new Error("Transation not valid");
        }
    }
    
    public async closeConnection() {
        (await this.#connection).end();
    }
};

export class ConnectionPool {
    private static connections: Connection[] = [];
    private static POOL_SIZE = 4;

    public constructor() {
        for(let i = 0 ; i < ConnectionPool.POOL_SIZE ; i++) ConnectionPool.connections.push(new Connection(false));
    }

    public getConnection() {
        let avaibleConnection = null;

        for(let connection of ConnectionPool.connections) {
            if(!connection.isInUse) {
                avaibleConnection = connection;
                break;
            }
        }

        if(avaibleConnection === null) {
            throw "No connections avaible";
        }

        avaibleConnection.isInUse = true;
        return avaibleConnection;

        // if(ConnectionPool.USERS < ConnectionPool.POOL_SIZE) {
        //     ConnectionPool.connections.push(new Connection());
        //     ConnectionPool.USERS++;
        // } else {
        //     throw "All connection are being used";
        // }
    }

    public async freeConnection(connection: Connection) {
        // await ConnectionPool.connections[ConnectionPool.USERS - 1].closeConnection();
        // ConnectionPool.connections.splice(ConnectionPool.USERS - 1, 1);
        await connection.closeConnection();
        connection.isInUse = false;
    }
}