import { AxiosInstance } from 'axios';
import { Keyring } from '@verida/keyring';
import { INotification } from '@verida/types';
export default class NotificationEngineVerida implements INotification {
    protected senderContextName: string;
    protected senderKeyring: Keyring;
    protected recipientContextName: string;
    protected serverUrls: string[];
    protected did: string;
    protected errors: string[];
    constructor(senderContextName: string, senderKeyring: Keyring, recipientContextName: string, did: string, serverUrls: string[]);
    init(): Promise<void>;
    /**
    * Ping a notification server to fetch new messages
    */
    ping(): Promise<boolean>;
    getErrors(): string[];
    protected getAxios(): Promise<AxiosInstance>;
}
