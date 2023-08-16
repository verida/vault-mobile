import { CredentialStatusType, core } from "@0xpolygonid/js-sdk";
import { AccountNodeDIDClientConfig, EnvironmentType } from "@verida/types";

export type VeridaConfig = {
  veridaPrivateKey: string;
  veridaEnvironment: EnvironmentType;
  veridaContextName: string;
  veridaDidClientConfig: AccountNodeDIDClientConfig;
  veridaCredentialRecordSchema: string;
};

export type PolygonIdConfig = {
  polygonIdPrivateKey: string;
  polygonIdBlockchain: core.Blockchain;
  polygonIdNetworkId: core.NetworkId;
  polygonIdDidMethod: core.DidMethod;
  polygonIdRevocationBaseUrl: string;
  polygonIdRevocationType: CredentialStatusType;
  polygonIdRpcUrl: string;
  polygonIdContractAddress: string;
};

export type PolygonIDManagerConfig = VeridaConfig & PolygonIdConfig;
