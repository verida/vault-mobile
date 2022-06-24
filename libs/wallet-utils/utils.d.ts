export declare class utils {
    /**
     * Create a new account
     * @param chain `ethereum` or `vechain`
     */
    static createWallet(chain: string): object;
    static getWallet(chain: string, mnemonic: string): object;
    static getPublicKey(chain: string, privateKey: string): string;
    static getAddress(chain: string, privateKey: string): string;
    static signMessage(chain: string, privateKey: string, message: string): Promise<string>;
    static recoverAddress(chain: string, message: string, signature: string): string;
    static verifySignature(chain: string, message: string, signature: string, did: string): Promise<boolean>;
}
