import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
} from "@0xpolygonid/js-sdk";
import { PolygonIDManager, PolygonIDManagerConfig } from "./PolygonIdManager";
import { logger, postMessageToWebView } from "./utils";

// Exposing methods to the global scope for the WebView to use.

// @ts-expect-error synthesized
window.__CREATE_POLYGON_ID_MANAGER__ = createPolygonIdManager;

// @ts-expect-error synthesized
window.__HANDLE_AUTHORIZATION_REQUEST__ = handleAuthorizationRequest;

// @ts-expect-error synthesized
window.__HANDLE_CREDENTIALS_OFFER__ = handleCredentialsOffer;

// @ts-expect-error synthesized
window.__HANDLE_PROMISE_TASK__ = handlePromiseTask;

/**
 * @description A mapping of manager IDs to their respective PolygonIDManager instances. Allows potential future use case of having multiple managers in the same app.
 */
const POLYGON_ID_MANAGERS: Record<string, PolygonIDManager> = {};

/**
 * Handles an authorization request.
 *
 * @param args The managerId to use and the data to handle.
 * @returns "Success" if the request was handled successfully.
 */
async function handleAuthorizationRequest({
  managerId,
  data,
}: {
  readonly managerId: string;
  readonly data: AuthorizationRequestMessage;
}) {
  // No try/catch here because the error is handled in handlePromiseTask
  const polygonIdManager = getPolygonIdManager({
    managerId,
  });
  logger.debug("Handle authorization request");
  return await polygonIdManager.handleAuthorizationRequest(data);
}

/**
 * Handles a credential offer.
 *
 * @param args The managerId to use and the data to handle.
 * @returns "Success" if the request was handled successfully.
 */
async function handleCredentialsOffer({
  managerId,
  data,
}: {
  readonly managerId: string;
  readonly data: CredentialsOfferMessage;
}) {
  // No try/catch here because the error is handled in handlePromiseTask
  const polygonIdManager = getPolygonIdManager({
    managerId,
  });
  logger.debug("Handle credentials offer");
  return await polygonIdManager.handleCredentialsOffer(data);
}

/**
 * Gets the PolygonIDManager instance associated with the given managerId.
 *
 * @param options Options to get the PolygonIDManager instance.
 * @returns The PolygonIdManager instance associated with the given managerId.
 */
function getPolygonIdManager({
  managerId,
}: {
  readonly managerId: string;
}): PolygonIDManager {
  logger.debug(`Getting Polygon ID Manager ${managerId}`);

  const { [managerId]: maybeExistingManager } = POLYGON_ID_MANAGERS;

  if (!maybeExistingManager) {
    logger.error(`Polygon ID Manager ${managerId} does not exist.`);
    throw new Error(
      `Attempted to access PolygonIDManager with managerId "${managerId}", but this does not exist.`
    );
  }

  return maybeExistingManager;
}

/**
 * Creates a new instance of the PolygonIDManager class and stores it in the POLYGON_ID_MANAGERS map.
 *
 * @param options The config and id for the new manager.
 * @returns The manager Id
 */
async function createPolygonIdManager({
  config,
  managerId,
}: {
  readonly config: PolygonIDManagerConfig;
  readonly managerId: string;
}): Promise<string> {
  logger.debug("Creating a Polygon ID Manager");

  const { [managerId]: maybeExistingManager } = POLYGON_ID_MANAGERS;

  if (maybeExistingManager) {
    logger.error(`Polygon ID Manager ${managerId} already exists.`);
    throw new Error(
      `Attempted to allocate a PolygonIDManager with managerId "${managerId}", but this was reserved.`
    );
  }

  // TODO: Implement a factory method for the PolygonIDManager class taking the config object and returns a new instance already initialised.
  const polygonIdManager = new PolygonIDManager(config);
  await polygonIdManager.shouldInit();

  Object.assign(POLYGON_ID_MANAGERS, { [managerId]: polygonIdManager });

  logger.debug(`Polygon ID Manager ${managerId} successfully created`);

  return managerId;
}

/**
 * Takes an arbitrary Promise and posts an equivalent message back to the listener. The "taskId" parameter is used to associate a result object within a given request life cycle.
 *
 * @param options The options with the taskId and the promise to execute
 * @returns void
 */
async function handlePromiseTask<T>({
  taskId,
  promise,
}: {
  readonly taskId: string;
  readonly promise: Promise<T>;
}) {
  try {
    logger.debug(`Executing task ${taskId}...`);

    const result: T = await promise;

    logger.debug(`Task ${taskId} resolved successfully.`);

    // Resolve with a "result" field to signify successful execution.
    return postMessageToWebView(JSON.stringify({ taskId, result }));
  } catch (cause) {
    logger.error(`Task ${taskId} failed to resolve.`);
    logger.error(cause);

    const error = new Error("Failed to resolve.", { cause });
    return postMessageToWebView(
      JSON.stringify({
        taskId,
        // Resolve with an "error" field to signify an erroneous invocation.
        error: JSON.parse(
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        ),
      })
    );
  }
}
