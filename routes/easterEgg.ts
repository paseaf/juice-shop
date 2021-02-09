/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import utils = require('../lib/utils')
import { challenges } from '../data/datacache'

export = function serveEasterEgg () {
  return (req, res) => {
    utils.solveIf(challenges.easterEggLevelTwoChallenge, () => { return true })
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/threejs-demo.html'))
  }
}
