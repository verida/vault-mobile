export default class utils {
    static createWallet(): object;
    static getWallet(seedPhrase: string): object;
    static createPrivateKey(): string;
    /**
     * Get the public key from a private key
     *
     * @param privateKey With a leading `0x`
     */
    static getPublicKey(privateKey: string): string;
    /**
     * Get the address from a private key
     *
     * @param privateKey With a leading `0x`
     */
    static getAddress(privateKey: string): string;
    /**
     * Sign a message
     *
     * @param privateKey With a leading `0x`
     * @param message Message to sign
     */
    static signMessage(privateKey: string, message: string): Promise<string>;
    /**
     * Recover an address from a message and signature
     *
     * @param message
     * @param signature
     */
    static recoverAddress(message: string, signature: string): void;
    /**
     * Verify a signature matches a given DID.
     *
     * This checks the blockchain to ensure the signature matches a valid public key
     * attached to the on chain DID.
     *
     * @param message
     * @param signature  (hex encoded)
     * @param did
     */
    static verifySignature(message: string, signature: string, did: string, config?: any): Promise<boolean>;
    static getNear(config: any): Promise<any>;
}
