import {
  type CircuitData,
  CircuitStorage,
  InMemoryDataSource,
  CircuitId,
  type IDataStorage,
  CredentialWallet,
  BjjProvider,
  IdentityWallet,
  KMS,
  KmsKeyType,
  CredentialStorage,
  EthStateStorage,
  type Identity,
  IdentityStorage,
  type Profile,
  type W3CCredential,
  InMemoryMerkleTreeStorage,
  type EthConnectionConfig,
  ProofService,
  type IStateStorage,
  type AuthDataPrepareFunc,
  DataPrepareHandlerFunc,
  PackageManager,
  PlainPacker,
  type ProvingParams,
  type StateVerificationFunc,
  VerificationHandlerFunc,
  type VerificationParams,
  ZKPPacker,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  IssuerResolver,
  RHSResolver,
  OnChainResolver,
  AgentResolver,
} from "@0xpolygonid/js-sdk";
import { proving } from "@iden3/js-jwz";
import { fetchAndDecodeBase64EncodedFile } from "./file";
import { VeridaPrivateKeyStore } from "../classes";
import { getVeridaDatabase, buildVeridaDataSource } from "./verida";
import { type Context } from "@verida/client-ts";
import {
  POLYGON_ID_KEYSTORE_DATABASE_NAME,
  POLYGON_ID_CREDENTIALS_DATABASE_NAME,
  POLYGON_ID_IDENTITY_DATABASE_NAME,
  POLYGON_ID_PROFILE_DATABASE_NAME,
} from "../constants";
import { PolygonIdConfig } from "../types";

export function buildCredentialWallet(
  dataStorage: IDataStorage,
  ethConnectionConfig: EthConnectionConfig
) {
  const statusRegistry = new CredentialStatusResolverRegistry();

  statusRegistry.register(
    CredentialStatusType.SparseMerkleTreeProof,
    new IssuerResolver()
  );

  statusRegistry.register(
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    new RHSResolver(dataStorage.states)
  );

  statusRegistry.register(
    CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
    new OnChainResolver([ethConnectionConfig])
  );

  statusRegistry.register(
    CredentialStatusType.Iden3commRevocationStatusV1,
    new AgentResolver()
  );

  return new CredentialWallet(dataStorage, statusRegistry);
}

export async function buildDataStorage(
  veridaContext: Context,
  ethConnectionConfig: EthConnectionConfig
): Promise<IDataStorage> {
  const dataStorage: IDataStorage = {
    credential: new CredentialStorage(
      await buildVeridaDataSource<W3CCredential>(
        veridaContext,
        POLYGON_ID_CREDENTIALS_DATABASE_NAME
      )
    ),
    identity: new IdentityStorage(
      await buildVeridaDataSource<Identity>(
        veridaContext,
        POLYGON_ID_IDENTITY_DATABASE_NAME
      ),
      await buildVeridaDataSource<Profile>(
        veridaContext,
        POLYGON_ID_PROFILE_DATABASE_NAME
      )
    ),
    mt: new InMemoryMerkleTreeStorage(40),
    states: new EthStateStorage(ethConnectionConfig),
  };

  return dataStorage;
}

export async function buildIdentityWallet(
  veridaContext: Context,
  dataStorage: IDataStorage,
  credentialWallet: CredentialWallet
): Promise<IdentityWallet> {
  const privateKeyStoreDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_KEYSTORE_DATABASE_NAME
  );
  const keyStore = new VeridaPrivateKeyStore(privateKeyStoreDatabase);
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

  return new IdentityWallet(kms, dataStorage, credentialWallet);
}

export function createPolygonIdIdentity(
  identityWallet: IdentityWallet,
  config: PolygonIdConfig
) {
  return identityWallet.createIdentity({
    method: config.polygonIdDidMethod,
    blockchain: config.polygonIdBlockchain,
    networkId: config.polygonIdNetworkId,
    seed: new Uint8Array(Buffer.from(config.polygonIdPrivateKey, "utf-8")),
    revocationOpts: {
      id: config.polygonIdRevocationBaseUrl,
      type: config.polygonIdRevocationType,
    },
  });
}

export function createCircuitStorage() {
  return new CircuitStorage(new InMemoryDataSource<CircuitData>());
}

export async function initCircuitStorage(circuitStorage: CircuitStorage) {
  Promise.all([
    circuitStorage.saveCircuitData(
      CircuitId.AuthV2,
      await getCircuitData(CircuitId.AuthV2)
    ),
    circuitStorage.saveCircuitData(
      CircuitId.AtomicQuerySigV2,
      await getCircuitData(CircuitId.AtomicQuerySigV2)
    ),
    circuitStorage.saveCircuitData(
      CircuitId.AtomicQueryMTPV2,
      await getCircuitData(CircuitId.AtomicQueryMTPV2)
    ),
  ]);
}

export async function getCircuitData(
  circuitId: CircuitId
): Promise<CircuitData> {
  // Our expectation is that the relevant files have been stored at the root directory by the React Native runtime. These should be saved at the server directory as: <server-dir>/public/circuits/<circuit-id>/<circuit-name>.<type>
  // TODO: Update the location (don't need the 'public' part)
  // TODO: Get the path from the config from the main app
  const [verificationKey, provingKey, wasm] = await Promise.all([
    fetchAndDecodeBase64EncodedFile(
      `/public/circuits/${circuitId}/verification_key.base64`
    ),
    fetchAndDecodeBase64EncodedFile(
      `/public/circuits/${circuitId}/circuit_final.base64`
    ),
    fetchAndDecodeBase64EncodedFile(
      `/public/circuits/${circuitId}/wasm.base64`
    ),
  ]);

  return { circuitId: String(circuitId), verificationKey, provingKey, wasm };
}

export function buildProofService(
  identityWallet: IdentityWallet,
  credentialWallet: CredentialWallet,
  circuitStorage: CircuitStorage,
  stateStorage: IStateStorage
) {
  return new ProofService(
    identityWallet,
    credentialWallet,
    circuitStorage,
    stateStorage,
    { ipfsGatewayURL: "https://ipfs.io" } // TODO: Get from configuration
  );
}

export function buildPackageManager(
  circuitData: CircuitData,
  prepareFn: AuthDataPrepareFunc,
  stateVerificationFn: StateVerificationFunc
): PackageManager {
  const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);

  const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
  const mapKey =
    proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();
  const verificationParamMap: Map<string, VerificationParams> = new Map([
    [
      mapKey,
      {
        key: circuitData.verificationKey!,
        verificationFn,
      },
    ],
  ]);

  const provingParamMap: Map<string, ProvingParams> = new Map();
  provingParamMap.set(mapKey, {
    dataPreparer: authInputsHandler,
    provingKey: circuitData.provingKey!,
    wasm: circuitData.wasm!,
  });

  const packer = new ZKPPacker(provingParamMap, verificationParamMap);
  const plainPacker = new PlainPacker();

  const packageManager = new PackageManager();
  packageManager.registerPackers([packer, plainPacker]);

  return packageManager;
}
