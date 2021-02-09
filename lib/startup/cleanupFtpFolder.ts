/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import glob = require('glob')
import path = require('path')
import fs = require('fs-extra')
import logger = require('../logger')

const cleanupFtpFolder = () => {
  glob(path.join(__dirname, '../../ftp/*.pdf'), (err, files) => {
    if (err) {
      logger.warn('Error listing PDF files in /ftp folder: ' + err.message)
    } else {
      files.forEach(filename => {
        fs.remove(filename)
      })
    }
  })
}

export = cleanupFtpFolder
