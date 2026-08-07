/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var plugin_exports = {};
__export(plugin_exports, {
  NocobasePluginDingtalkServer: () => NocobasePluginDingtalkServer,
  default: () => plugin_default
});
module.exports = __toCommonJS(plugin_exports);
var import_server = require("@nocobase/server");
var import_utils = require("@nocobase/utils");
var import_constants = require("../shared/constants");
var import_DingTalkAuth = require("./auth/DingTalkAuth");
var import_dingTalkActions = require("./actions/dingTalkActions");
class NocobasePluginDingtalkServer extends import_server.Plugin {
  async load() {
    this.app.authManager.registerTypes(import_constants.AuthName, {
      title: (0, import_utils.tval)("DingTalk login (scan)", { ns: import_constants.PluginName }),
      auth: import_DingTalkAuth.DingTalkAuth
    });
    this.app.resourceManager.define({
      name: import_constants.ResourceName,
      actions: import_dingTalkActions.dingTalkActions
    });
    this.app.acl.allow(import_constants.ResourceName, "*");
  }
}
var plugin_default = NocobasePluginDingtalkServer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NocobasePluginDingtalkServer
});
