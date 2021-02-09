/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import insecurity = require('../lib/insecurity')
import utils = require('../lib/utils')
import cache = require('../data/datacache')
const challenges = cache.challenges

export = function retrieveLoggedInUser () {
  return (req, res) => {
    let user
    try {
      if (insecurity.verify(req.cookies.token)) {
        user = insecurity.authenticatedUsers.get(req.cookies.token)
      }
    } catch (err) {
      user = undefined
    } finally {
      const response = { user: { id: (user && user.data ? user.data.id : undefined), email: (user && user.data ? user.data.email : undefined), lastLoginIp: (user && user.data ? user.data.lastLoginIp : undefined), profileImage: (user && user.data ? user.data.profileImage : undefined) } }
      if (req.query.callback === undefined) {
        res.json(response)
      } else {
        utils.solveIf(challenges.emailLeakChallenge, () => { return true })
        res.jsonp(response)
      }
    }
  }
}
