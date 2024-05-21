import { DatabaseDeleteConfig, DbRegistryEntry } from "@verida/types";
import BaseDb from "./base-db";
/**
 * @category
 * Modules
 */
declare class PublicDatabase extends BaseDb {
    info(): Promise<any>;
    registryEntry(): Promise<DbRegistryEntry>;
    destroy(options?: DatabaseDeleteConfig): Promise<void>;
}
export default PublicDatabase;
