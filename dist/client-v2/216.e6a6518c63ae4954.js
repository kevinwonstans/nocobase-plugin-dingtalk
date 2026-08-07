/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

"use strict";(self.webpackChunknocobase_plugin_dingtalk_client_v2=self.webpackChunknocobase_plugin_dingtalk_client_v2||[]).push([["216"],{491:function(e,n,t){t.r(n),t.d(n,{AdminSettingsForm:function(){return u}});var l=t(59),a=t(155),r=t.n(a),o=t(953),m=t(96),u=function(){var e=(0,o.useTranslation)(["nocobase-plugin-dingtalk","client"]).t;return r().createElement(r().Fragment,null,r().createElement(l.Form.Item,{name:["options","public","autoSignup"],valuePropName:"checked"},r().createElement(l.Checkbox,null,e("Auto register if user not found"))),r().createElement(l.Form.Item,{name:["options","internal","userCheckType"],label:e("User match type"),rules:[{required:!0}]},r().createElement(l.Select,{options:m.q2.map(function(n){return{value:n.value,label:e(n.labelKey)}})})),r().createElement(l.Form.Item,{name:["options","internal","emailDomain"],label:e("Email domains, separated by commas"),rules:[{required:!0}]},r().createElement(l.Input,{placeholder:"example.com, corp.example.com"})),r().createElement(l.Form.Item,{name:["options","internal","appKey"],label:e("AppKey"),rules:[{required:!0}]},r().createElement(l.Input,null)),r().createElement(l.Form.Item,{name:["options","internal","appSecret"],label:e("AppSecret"),rules:[{required:!0}]},r().createElement(l.Input.Password,null)))};n.default=u}}]);