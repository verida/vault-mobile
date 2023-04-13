import {
  PolygonIDManager,
  PolygonIDManagerConfig,
} from './polygon'

// Here, we're going to store PolygonIDManagers for future reference.
// Like, I don't know if we're going to want to use it for other things,
// but that is a probable case.
const POLYGON_ID_MANAGERS: Record<string, PolygonIDManager> = {};

const createPolygonIdManager = async ({
  config,
  managerId,
}: {
  readonly config: PolygonIDManagerConfig;
  readonly managerId: string;
}): Promise<string> => {

  const {[managerId]: maybeExistingManager} = POLYGON_ID_MANAGERS;

  if (maybeExistingManager)
    throw new Error(`Attempted to allocate a PolygonIDManager with managerId "${
      managerId
    }", but this was reserved.`);

  const polygonIdManager = new PolygonIDManager(config);

  // TODO: We should declare this context object and use it to construct
  //       the PolygonIDManager. Constructing the manager should mean
  //       constructing it; not splitting initialization into different
  //       steps.
  await polygonIdManager.shouldInit();

  Object.assign(POLYGON_ID_MANAGERS, {[managerId]: polygonIdManager});

  return managerId;
};

const getPolygonIdManager = ({
  managerId,
}: {
  readonly managerId: string;
}): PolygonIDManager => {

  const {[managerId]: maybeExistingManager} = POLYGON_ID_MANAGERS;

  if (!maybeExistingManager)
    throw new Error(`Attempted to access PolygonIDManager with managerId "${
      managerId
    }", but this does not exist.`);

  return maybeExistingManager;
};

const onHandleQrCodeString = async ({
  managerId,
  qrCodeString: qrCodeData,
}: {
  readonly managerId: string;
  readonly qrCodeString: string;
}) => {

  const polygonIdManager = getPolygonIdManager({
    managerId,
  });

  // Decoding the QR code data
  const data = polygonIdManager.decodeQRCode(qrCodeData);

  // TODO: If the Manager is in the WebView, this function can be brought back in this context

  console.log("=========================================================");
  console.log("Decoded data:", data);

  let result = "Something went wrong";

  switch (data.type) {
    case "https://iden3-communication.io/authorization/1.0/request":
      // Either a Connection request or a ZK Proof request
      if (data.body.scope) {
        // We have a scope object implying we need to submit a ZK proof
        try {
          console.log("Received a ZK Proof request");

          await polygonIdManager.handleAuthRequest(data);
          // TODO: Instead of calling the Manager, we need to mount the WebView and pass the data to it. We need to listen to the WebView to get the result though.

          result = "ZK Proof request handled successfully";
        } catch (error: unknown) {
          result = "ZK Proof request failed";
          console.error(error);
        }
      } else {
        // We have a generic connection request
        try {
          console.log("Received a connection request");

          await polygonIdManager.handleAuthRequest(data);
          // TODO: Instead of calling the Manager, we need to mount the WebView and pass the data to it. We need to listen to the WebView to get the result though.

          result = "Connection request handled successfully";
        } catch (error: unknown) {
          result = "Connection request failed";
          console.error(error);
        }
      }
      break;
    case "https://iden3-communication.io/credentials/1.0/offer":
      // Offer to save a new ZK credential
      try {
        console.log("Received a ZK Credential offer");

        await polygonIdManager.handleFetch(data);
        // TODO: Instead of calling the Manager, we need to mount the WebView and pass the data to it. We need to listen to the WebView to get the result though.

        result = "ZK Credential offer handled successfully";
      } catch (error: unknown) {
        result = "ZK Credential offer failed";
        console.error(error);
      }
      break;
  }
  console.log(result);
  console.log("=========================================================");

  return result;
};

// Sends a message from the page back into React Native (if defined).
function shouldPostMessage(message: string) {
  // @ts-ignore
  if (window?.ReactNativeWebView) return window.ReactNativeWebView.postMessage(message);

  // @ts-ignore
  return window?.top?.postMessage?.(
    message,
    // @ts-ignore
    // eslint-disable-next-line eqeqeq
    (window.location != window.parent.location)
      ? document.referrer
      : document.location,
  );
}

// Takes an arbitrary Promise and posts an equivalent message back to the listener.
// The "taskId" parameter is used to associate a result object within a given request
// life cycle.
async function promisePostMessage<T>({
  taskId,
  promise,
}: {
  readonly taskId: string;
  readonly promise: Promise<T>;
}) {
  try {

    const result: T = await promise;

    // Resolve with a "data" field to signify successful execution.
    return shouldPostMessage(JSON.stringify({taskId, data: result}));

  } catch (cause) {

    const error = new Error('Failed to resolve.', {cause});

    return shouldPostMessage(
      JSON.stringify({
        taskId,
        // Resolve with an "error" field to signify an erroneous invocation.
        error: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
      }),
    );

  }
}

// @ts-expect-error synthesized
window.__CREATE_POLYGON_ID_MANAGER__ = createPolygonIdManager;

// @ts-expect-error synthesized
window.__HANDLE_QR_CODE_STRING__ = onHandleQrCodeString;

// @ts-expect-error synthesized
window.__ASYNC_MESSAGE__ = promisePostMessage;

//void (async () => {
//  const config: PolygonIDManagerConfig = {
//    polygonIdSeed: "daveseedseedseedseedseedseeduser",
//    veridaPrivateKey:
//        "sphere divide black dove never shoot world issue brand achieve income raw",
//    // @ts-ignore
//    environment: 'testnet',
//    contextName: "Verida: Vault",
//    didClientConfig: {
//      callType: "gasless",
//      web3Config: {
//        rpcUrl: "https://rpc-mumbai.maticvigil.com/",
//        serverConfig: {
//          headers: {
//            "context-name": "Verida: Vault",
//          },
//        },
//        postConfig: {
//          headers: {
//            "user-agent": "Verida-Vault",
//          },
//        },
//        endpointUrl: "https://meta-tx-server1.tn.verida.tech",
//      },
//      rpcUrl: "https://rpc-mumbai.maticvigil.com/",
//      didEndpoints: [],
//    },
//  };
//
//  try {
//    const managerId = "hello-world";
//
//    alert('starting');
//
//    // @ts-ignore
//    await window.__CREATE_POLYGON_ID_MANAGER__({managerId, config});
//
//    // @ts-ignore
//    const result = await window.__HANDLE_QR_CODE_STRING__({
//      managerId,
//      qrCodeString: "{\"id\":\"f474e2d9-e6e5-4063-88fc-88bccf0ae98d\",\"typ\":\"application/iden3comm-plain-json\",\"type\":\"https://iden3-communication.io/authorization/1.0/request\",\"thid\":\"f474e2d9-e6e5-4063-88fc-88bccf0ae98d\",\"body\":{\"callbackUrl\":\"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=420095\",\"reason\":\"test flow\",\"scope\":[]},\"from\":\"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5\"}",
//    });
//
//    alert('here with'+result);
//
//  } catch (e) {
//    console.error(e);
//  }
//})();
