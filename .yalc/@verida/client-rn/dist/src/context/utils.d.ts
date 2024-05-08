import { Context } from "..";
export interface RecordSignatureOptions {
    signContext: Context;
}
/**
 * Generates a signature for the given record
 */
export declare class RecordSignature {
    /**
     * Computes and returns the signature
     *
     * @param data Source of data required to generate the Signature
     * @param options required parameter
     */
    static generateSignature(data: any, options: RecordSignatureOptions): Promise<any>;
}
export declare function getRandomInt(min: number, max: number): number;
