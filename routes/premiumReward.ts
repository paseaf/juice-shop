/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import utils = require('../lib/utils')
import { challenges } from '../data/datacache'

export = function servePremiumContent () {
  return (req, res) => {
    utils.solveIf(challenges.premiumPaywallChallenge, () => { return true })
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/JuiceShop_Wallpaper_1920x1080_VR.jpg'))
  }
}
