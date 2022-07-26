import { Driver } from "../Driver";
import { ColumnType } from "../types/ColumnTypes";
import { DataTypeDefaults } from "../types/DataTypeDefaults";
import { MappedColumnTypes } from "../types/MappedColumnTypes";
import { SchemaBuilder } from "../../schema-builder/SchemaBuilder";
import { QueryRunner } from "../../query-runner/QueryRunner";
import { ObjectLiteral } from "../../common/ObjectLiteral";
import { ColumnMetadata } from "../../metadata/ColumnMetadata";
import { TableColumn } from "../../schema-builder/table/TableColumn";
import { EntityMetadata } from "../../metadata/EntityMetadata";
import { Connection } from "../../connection/Connection";
import { FirebirdConnectionOptions } from "./FirebirdConnectionOptions";
import { Database, Options, ConnectionPool } from "node-firebird";
export declare class FirebirdDriver implements Driver {
    options: FirebirdConnectionOptions;
    database?: string | undefined;
    isReplicated: boolean;
    treeSupport: boolean;
    supportedDataTypes: ColumnType[];
    dataTypeDefaults: DataTypeDefaults;
    spatialTypes: ColumnType[];
    withLengthColumnTypes: ColumnType[];
    withPrecisionColumnTypes: ColumnType[];
    withScaleColumnTypes: ColumnType[];
    mappedDataTypes: MappedColumnTypes;
    connection: Connection;
    /**
     * Database connection object from node-firebird
     */
    firebird: any;
    /**
     * Connection options for firebird connection
     */
    firebirdOptions: Options;
    /**
     * Database pool connection object from node-firebird
     */
    firebirdPool: ConnectionPool;
    /**
     * Firebrid database (no pooling)
     */
    firebirdDatabase: Database;
    constructor(connection: Connection);
    connect(): Promise<void>;
    afterConnect(): Promise<void>;
    disconnect(): Promise<void>;
    createSchemaBuilder(): SchemaBuilder;
    createQueryRunner(mode: "master" | "slave"): QueryRunner;
    escapeQueryWithParameters(sql: string, parameters: ObjectLiteral, nativeParameters: ObjectLiteral): [string, any[]];
    escape(columnName: string): string;
    buildTableName(tableName: string, schema?: string | undefined, database?: string | undefined): string;
    preparePersistentValue(value: any, columnMetadata: ColumnMetadata): any;
    prepareHydratedValue(value: any, columnMetadata: ColumnMetadata): any;
    normalizeType(column: {
        type?: string | BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor | undefined;
        length?: string | number | undefined;
        precision?: number | null | undefined;
        scale?: number | undefined;
        isArray?: boolean | undefined;
    }): string;
    normalizeDefault(columnMetadata: ColumnMetadata): string;
    normalizeIsUnique(column: ColumnMetadata): boolean;
    getColumnLength(column: ColumnMetadata | TableColumn): string;
    createFullType(column: TableColumn): string;
    obtainMasterConnection(): Promise<any>;
    obtainSlaveConnection(): Promise<any>;
    createGeneratedMap(metadata: EntityMetadata, insertResult: any): ObjectLiteral | undefined;
    findChangedColumns(tableColumns: TableColumn[], columnMetadatas: ColumnMetadata[]): ColumnMetadata[];
    isReturningSqlSupported(): boolean;
    isUUIDGenerationSupported(): boolean;
    createParameter(parameterName: string, index: number): string;
}
