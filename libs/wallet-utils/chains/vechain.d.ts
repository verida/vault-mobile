/// <reference types="node" />
export default class utils {
    static createWallet(): object;
    static getWallet(words: string): object;
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
    static hexToBuffer(hex: string): Buffer;
    /**
     * Recover an address from a message and signature
     *
     * @param message
     * @param signature
     */
    static recoverAddress(message: string, signature: string): string | undefined;
}
