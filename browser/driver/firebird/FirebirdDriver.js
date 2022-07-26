import * as tslib_1 from "tslib";
import { RdbmsSchemaBuilder } from "../../schema-builder/RdbmsSchemaBuilder";
import { FirebirdQueryRunner } from "./FirebirdQueryRunner";
import { DateUtils } from "../../util/DateUtils";
import { OrmUtils } from "../../util/OrmUtils";
import { ApplyValueTransformers } from "../../util/ApplyValueTransformers";
var FirebirdDriver = /** @class */ (function () {
    function FirebirdDriver(connection) {
        this.supportedDataTypes = [
            "int",
            "smallint",
            "bigint",
            "float",
            "double precision",
            "decimal",
            "numeric",
            "date",
            "timestamp",
            "time",
            "char",
            "character",
            "varchar",
            "blob"
        ];
        this.dataTypeDefaults = {
            "varchar": { length: 255 },
            "char": { length: 1 },
            "decimal": { precision: 10, scale: 0 },
            "float": { precision: 12 },
            "double": { precision: 22 },
            "int": { width: 11 },
            "smallint": { width: 6 },
            "bigint": { width: 20 }
        };
        this.spatialTypes = [];
        this.withLengthColumnTypes = [
            "char",
            "varchar",
            "character"
        ];
        this.withPrecisionColumnTypes = [
            "decimal",
            "numeric"
        ];
        this.withScaleColumnTypes = [
            "decimal",
            "numeric"
        ];
        this.mappedDataTypes = {
            createDate: "timestamp",
            createDatePrecision: 6,
            createDateDefault: "NOW",
            updateDate: "timestamp",
            updateDatePrecision: 6,
            updateDateDefault: "NOW",
            deleteDate: "timestamp",
            deleteDatePrecision: 6,
            deleteDateNullable: true,
            version: "int",
            treeLevel: "int",
            migrationId: "int",
            migrationName: "varchar",
            migrationTimestamp: "bigint",
            cacheId: "int",
            cacheIdentifier: "varchar",
            cacheTime: "bigint",
            cacheDuration: "int",
            cacheQuery: "blob",
            cacheResult: "blob",
            metadataType: "varchar",
            metadataDatabase: "varchar",
            metadataSchema: "varchar",
            metadataTable: "varchar",
            metadataName: "varchar",
            metadataValue: "blob sub_type text",
        };
        this.connection = connection;
        this.options = connection.options;
        this.firebirdOptions = connection.options;
        // load mysql package
        // TODO: Temporary workaround for https://github.com/typeorm/typeorm/issues/4210
        this.firebird = require("node-firebird");
    }
    FirebirdDriver.prototype.connect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        if (_this.options.pooling) {
                            _this.firebirdPool = _this.firebird.pool(5, _this.firebirdOptions);
                            _this.firebirdPool.get(function (err, database) {
                                if (err) {
                                    fail(err);
                                }
                                _this.firebirdDatabase = database;
                                ok();
                            });
                        }
                        else {
                            _this.firebird.attachOrCreate(_this.firebirdOptions, function (err, database) {
                                if (err) {
                                    fail(err);
                                }
                                _this.firebirdDatabase = database;
                                ok();
                            });
                        }
                    })];
            });
        });
    };
    FirebirdDriver.prototype.afterConnect = function () {
        return Promise.resolve();
    };
    FirebirdDriver.prototype.disconnect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        if (_this.options.pooling) {
                            _this.firebirdPool.destroy();
                            ok();
                        }
                        else {
                            _this.firebirdDatabase.detach(function () { return ok(); });
                        }
                    })];
            });
        });
    };
    FirebirdDriver.prototype.createSchemaBuilder = function () {
        return new RdbmsSchemaBuilder(this.connection);
    };
    FirebirdDriver.prototype.createQueryRunner = function (mode) {
        return new FirebirdQueryRunner(this);
    };
    FirebirdDriver.prototype.escapeQueryWithParameters = function (sql, parameters, nativeParameters) {
        var escapedParameters = Object.keys(nativeParameters).map(function (key) { return nativeParameters[key]; });
        if (!parameters || !Object.keys(parameters).length)
            return [sql, escapedParameters];
        var keys = Object.keys(parameters).map(function (parameter) { return "(:(\\.\\.\\.)?" + parameter + "\\b)"; }).join("|");
        sql = sql.replace(new RegExp(keys, "g"), function (key) {
            var spreadParam;
            var value;
            if (key.substr(0, 4) === ":...") {
                spreadParam = true;
                value = parameters[key.substr(4)];
            }
            else {
                spreadParam = false;
                value = parameters[key.substr(1)];
            }
            if (value instanceof Function) {
                return value();
            }
            else if (spreadParam) {
                value.forEach(function (param) { return escapedParameters.push(param); });
                return new Array(value.length).fill('?').join(', ');
            }
            else {
                escapedParameters.push(value);
                return "?";
            }
        }); // todo: make replace only in value statements, otherwise problems
        return [sql, escapedParameters];
    };
    FirebirdDriver.prototype.escape = function (columnName) {
        return columnName.toUpperCase();
    };
    FirebirdDriver.prototype.buildTableName = function (tableName, schema, database) {
        return tableName.toUpperCase();
    };
    FirebirdDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = ApplyValueTransformers.transformTo(columnMetadata.transformer, value);
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            return value === true ? 1 : 0;
        }
        else if (columnMetadata.type === "date") {
            return DateUtils.mixedDateToDateString(value);
        }
        else if (columnMetadata.type === "time") {
            return DateUtils.mixedDateToTimeString(value);
        }
        else if (columnMetadata.type === "timestamp" || columnMetadata.type === "datetime" || columnMetadata.type === Date) {
            return DateUtils.mixedDateToDate(value);
        }
        return value;
    };
    FirebirdDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            value = value ? true : false;
        }
        else if (columnMetadata.type === "datetime" || columnMetadata.type === Date) {
            value = DateUtils.normalizeHydratedDate(value);
        }
        else if (columnMetadata.type === "date") {
            value = DateUtils.mixedDateToDateString(value);
        }
        if (columnMetadata.transformer)
            value = ApplyValueTransformers.transformFrom(columnMetadata.transformer, value);
        return value;
    };
    FirebirdDriver.prototype.normalizeType = function (column) {
        if (column.type === Number || column.type === "integer") {
            return "int";
        }
        else if (column.type === String || column.type === "nvarchar") {
            return "varchar";
        }
        else if (column.type === Date) {
            return "datetime";
        }
        else if (column.type === Buffer) {
            return "blob";
        }
        else if (column.type === Boolean) {
            return "char";
        }
        else if (column.type === "numeric" || column.type === "dec") {
            return "numeric";
        }
        else if (column.type === "uuid") {
            return "varchar";
        }
        else if (column.type === "simple-array" || column.type === "simple-json") {
            return "blob";
        }
        else {
            return column.type || "";
        }
    };
    FirebirdDriver.prototype.normalizeDefault = function (columnMetadata) {
        var defaultValue = columnMetadata.default;
        if (typeof defaultValue === "number") {
            return "" + defaultValue;
        }
        else if (typeof defaultValue === "boolean") {
            return defaultValue === true ? "T" : "F";
        }
        else if (typeof defaultValue === "function") {
            return defaultValue();
        }
        else if (typeof defaultValue === "string") {
            return "'" + defaultValue + "'";
        }
        else {
            return defaultValue;
        }
    };
    FirebirdDriver.prototype.normalizeIsUnique = function (column) {
        return column.entityMetadata.indices.some(function (idx) { return idx.isUnique && idx.columns.length === 1 && idx.columns[0] === column; });
    };
    FirebirdDriver.prototype.getColumnLength = function (column) {
        if (column.length)
            return column.length.toString();
        switch (column.type) {
            case String:
            case "varchar":
                return "255";
            case "uuid":
                return "36";
            default:
                return "";
        }
    };
    FirebirdDriver.prototype.createFullType = function (column) {
        var type = column.type;
        // used 'getColumnLength()' method, because Firebird requires column length for `varchar`, `nvarchar` and `varbinary` data types
        if (this.getColumnLength(column)) {
            type += "(" + this.getColumnLength(column) + ")";
        }
        else if (column.width) {
            type += "(" + column.width + ")";
        }
        else if (column.precision !== null && column.precision !== undefined && column.scale !== null && column.scale !== undefined) {
            type += "(" + column.precision + "," + column.scale + ")";
        }
        else if (column.precision !== null && column.precision !== undefined) {
            type += "(" + column.precision + ")";
        }
        if (column.isArray)
            type += " array";
        return type;
    };
    FirebirdDriver.prototype.obtainMasterConnection = function () {
        return this.connect();
    };
    FirebirdDriver.prototype.obtainSlaveConnection = function () {
        return this.connect();
    };
    FirebirdDriver.prototype.createGeneratedMap = function (metadata, insertResult) {
        var generatedMap = metadata.generatedColumns.reduce(function (map, generatedColumn) {
            var value;
            if (generatedColumn.generationStrategy === "increment" && insertResult.insertId) {
                value = insertResult.insertId;
            }
            return OrmUtils.mergeDeep(map, generatedColumn.createValueMap(value));
        }, {});
        return Object.keys(generatedMap).length > 0 ? generatedMap : undefined;
    };
    FirebirdDriver.prototype.findChangedColumns = function (tableColumns, columnMetadatas) {
        var _this = this;
        return columnMetadatas.filter(function (columnMetadata) {
            var tableColumn = tableColumns.find(function (c) { return c.name === columnMetadata.databaseName; });
            if (!tableColumn)
                return false; // we don't need new columns, we only need exist and changed
            return tableColumn.name !== columnMetadata.databaseName
                || tableColumn.type !== _this.normalizeType(columnMetadata)
                || tableColumn.length !== columnMetadata.length
                || tableColumn.width !== columnMetadata.width
                || tableColumn.precision !== columnMetadata.precision
                || tableColumn.scale !== columnMetadata.scale
                || tableColumn.zerofill !== columnMetadata.zerofill
                || tableColumn.unsigned !== columnMetadata.unsigned
                || tableColumn.asExpression !== columnMetadata.asExpression
                || tableColumn.generatedType !== columnMetadata.generatedType
                || tableColumn.onUpdate !== columnMetadata.onUpdate
                || tableColumn.isPrimary !== columnMetadata.isPrimary
                || tableColumn.isNullable !== columnMetadata.isNullable
                || tableColumn.isUnique !== _this.normalizeIsUnique(columnMetadata)
                || (columnMetadata.generationStrategy !== "uuid" && tableColumn.isGenerated !== columnMetadata.isGenerated);
        });
    };
    FirebirdDriver.prototype.isReturningSqlSupported = function () {
        return false;
    };
    FirebirdDriver.prototype.isUUIDGenerationSupported = function () {
        return false;
    };
    FirebirdDriver.prototype.createParameter = function (parameterName, index) {
        return "?";
    };
    return FirebirdDriver;
}());
export { FirebirdDriver };

//# sourceMappingURL=FirebirdDriver.js.map
