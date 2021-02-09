/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import express = require('express');
const app = express();
import { Server } from 'http'
const server = new Server(app)
import request = require('request')
import colors = require('colors/safe')
import logger = require('./../lib/logger')
import serverApp = require('./../server')

import url = require('url')
import protractorConf = require('../protractor.conf.js')
const originalBase = protractorConf.config.baseUrl
import protractorSubfolderConf = require('../protractor.subfolder.conf.js')
const baseUrl = new url.URL(protractorSubfolderConf.config.baseUrl)
const basePath = baseUrl.pathname
const proxyPort = baseUrl.port
process.env.BASE_PATH = basePath

app.use('/subfolder', (req, res) => {
  const proxyUrl = originalBase + req.url
  req.pipe(request({ qs: req.query, uri: proxyUrl })).pipe(res)
})

export const start = async function (readyCallback) {
  serverApp.start(() => {
    server.listen(proxyPort, () => {
      logger.info(colors.cyan(`Subfolder proxy listening on port ${proxyPort}`))

      if (readyCallback) {
        readyCallback()
      }
    })
  })
}

export const close = function (exitCode) {
  return serverApp.close(exitCode)
}

const ownFilename = __filename.slice(__dirname.length + 1)
if (process.argv && process.argv.length > 1 && process.argv[1].endsWith(ownFilename)) {
  start()
}
