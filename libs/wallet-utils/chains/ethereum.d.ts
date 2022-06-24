export default class utils {
    static createWallet(): object;
    static getWallet(mnemonic: string): object;
    static getPublicKey(privateKey: string): string;
    static getAddress(privateKey: string): string;
    static signMessage(privateKey: string, message: string): Promise<string>;
    /**
     * Recover an address from a message and signature
     *
     * @param message
     * @param signature
     */
    static recoverAddress(message: string, signature: string): string | undefined;
    static verifySignature(message: string, signature: string, did: string, config?: any): Promise<boolean>;
}
