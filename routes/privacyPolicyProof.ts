/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import utils = require('../lib/utils')
import { challenges } from '../data/datacache'

export = function servePrivacyPolicyProof () {
  return (req, res) => {
    utils.solveIf(challenges.privacyPolicyProofChallenge, () => { return true })
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/thank-you.jpg'))
  }
}
