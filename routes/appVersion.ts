/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import config = require('config')

export = function retrieveAppVersion () {
  return (req, res) => {
    res.json({
      version: config.get('application.showVersionNumber') ? utils.version() : ''
    })
  }
}
