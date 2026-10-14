/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _utils from "../_utils.js";
import type * as carousel from "../carousel.js";
import type * as cleanupHistory from "../cleanupHistory.js";
import type * as cleanupPinned from "../cleanupPinned.js";
import type * as conversation from "../conversation.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as event from "../event.js";
import type * as events from "../events.js";
import type * as friend from "../friend.js";
import type * as friends from "../friends.js";
import type * as history from "../history.js";
import type * as http from "../http.js";
import type * as indexBrowser from "../indexBrowser.js";
import type * as indexCover from "../indexCover.js";
import type * as indexLetter from "../indexLetter.js";
import type * as indexMigration from "../indexMigration.js";
import type * as list from "../list.js";
import type * as lists from "../lists.js";
import type * as message from "../message.js";
import type * as messages from "../messages.js";
import type * as pin from "../pin.js";
import type * as pins from "../pins.js";
import type * as request from "../request.js";
import type * as requests from "../requests.js";
import type * as save from "../save.js";
import type * as saves from "../saves.js";
import type * as user from "../user.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  _utils: typeof _utils;
  carousel: typeof carousel;
  cleanupHistory: typeof cleanupHistory;
  cleanupPinned: typeof cleanupPinned;
  conversation: typeof conversation;
  conversations: typeof conversations;
  crons: typeof crons;
  event: typeof event;
  events: typeof events;
  friend: typeof friend;
  friends: typeof friends;
  history: typeof history;
  http: typeof http;
  indexBrowser: typeof indexBrowser;
  indexCover: typeof indexCover;
  indexLetter: typeof indexLetter;
  indexMigration: typeof indexMigration;
  list: typeof list;
  lists: typeof lists;
  message: typeof message;
  messages: typeof messages;
  pin: typeof pin;
  pins: typeof pins;
  request: typeof request;
  requests: typeof requests;
  save: typeof save;
  saves: typeof saves;
  user: typeof user;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
