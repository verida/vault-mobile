export default class utils {
    static createWallet(): object;
    static getWallet(mnemonic: string): object;
    static getPublicKey(privateKey: string): string;
    static getAddress(privateKey: string): string;
    static signMessage(privateKey: string, message: string): Promise<string>;
    static recoverAddress(): void;
    static verifySignature(message: string, signature: string, did: string): Promise<boolean>;
}
