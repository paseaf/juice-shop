/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import Hashids = require('hashids/cjs')
const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
import { challenges } from '../data/datacache'
import utils = require('../lib/utils')

export = function restoreProgress () {
  return ({ params }, res) => {
    const continueCode = params.continueCode
    const ids = hashids.decode(continueCode)
    if (utils.notSolved(challenges.continueCodeChallenge) && ids.indexOf(999) > -1) {
      utils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (const name in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, name)) {
          if (ids.includes(challenges[name].id)) {
            utils.solve(challenges[name], true)
          }
        }
      }
      res.json({ data: ids.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}
