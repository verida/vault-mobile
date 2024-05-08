import { ISchema } from '@verida/types';
import Ajv2020 from "ajv/dist/2020";
/**
 * @category
 * Modules
 */
declare class Schema implements ISchema {
    errors: string[];
    protected path: string;
    protected ajv: Ajv2020;
    protected schemaJson?: object;
    protected finalPath?: string;
    protected specification?: any;
    protected validateFunction?: any;
    protected static schemaPaths?: Record<string, string>;
    protected static schemas: any;
    /**
     * An object representation of a JSON Schema.
     *
     * **Do not instantiate directly.**
     *
     * Access via {@link App#getSchema}
     * @param {string} path Path to a schema in the form (http://..../schema.json, /schemas/name/schema.json, name/of/schema)
     * @constructor
     */
    constructor(path: string, options?: any);
    static getSchema(schemaName: string): Promise<Schema>;
    static setSchemaPaths(schemaPaths: Record<string, string>): void;
    static getSchemaPaths(): Record<string, string>;
    /**
     * @todo: Deprecate in favour of `getProperties()`
     * Get an object that represents the JSON Schema. Fully resolved.
     * Warning: This can cause issues with very large schemas.
     *
     * @example
     * let schemaDoc = await app.getSchema("social/contact");
     * let spec = schemaDoc.getSpecification();
     * console.log(spec);
     * @returns {object} JSON object representing the defereferenced schema
     */
    getSpecification(): Promise<any>;
    /**
     * Validate a data object with this schema, using AJV
     *
     * @param {object} data
     * @returns {boolean} True if the data validates against the schema.
     */
    validate(data: any): Promise<boolean>;
    /**
     * Fetch unresolved JSON schema
     */
    getSchemaJson(): Promise<object>;
    getAppearance(): Promise<any>;
    /**
     * Get a rully resolveable path for a URL
     *
     * Handle shortened paths:
     *  - `health/activity` -> `https://common.schemas.verida.io/health/activity/latest/schema.json`
     *  - `https://common/schemas.verida.io/health/activity/latest` -> `https://common.schemas.verida.io/health/activity/latest/schema.json`
     *  - `/health/activity/test.json` -> `https://common/schemas.verida.io/health/activity/test.json`
     */
    protected getPath(): Promise<string>;
    /**
     * Force schema paths to be applied to URLs
     *
     */
    static resolvePath(uri: string): Promise<string>;
    /**
     * Load JSON from a url that is fully resolved.
     *
     * Used by AJV.
     *
     * @param {*} uri
     */
    static loadJson(uri: string): Promise<object>;
    /**
     * Checks a version specified in schemaName
     *
     * SchemaName example  :-  https://core.schemas.verida.io/base/v0.1.0/schema.json
     * SchemaName format :- https://{protocol-name}/{name}/{v}{version}/name.json
     * @param schemaName
     * @returns schemaName without the version
     */
    static getVersionlessSchemaName(schemaName: string): string;
}
export default Schema;
