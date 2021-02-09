/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import request = require('request')
import { promisify } from 'util'
import colors = require('colors/safe')
import logger = require('../lib/logger')
import utils = require('./utils')
import os = require('os')
import config = require('config')
const post = promisify(request.post)

export const notify = async (challenge, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  const res = await post(webhook, {
    json: {
      solution: {
        challenge: challenge.key,
        evidence: null,
        issuedOn: new Date().toISOString()
      },
      ctfFlag: utils.ctfFlag(challenge.name),
      issuer: {
        hostName: os.hostname(),
        os: `${os.type()} (${os.release()})`,
        appName: config.get('application.name'),
        config: process.env.NODE_ENV || 'default',
        version: utils.version()
      }
    }
  })
  logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
}
