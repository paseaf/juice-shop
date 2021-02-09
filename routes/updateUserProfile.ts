/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import insecurity = require('../lib/insecurity')
import utils = require('../lib/utils')
import cache = require('../data/datacache')
const challenges = cache.challenges

export = function updateUserProfile () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)

    if (loggedInUser) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        utils.solveIf(challenges.csrfChallenge, () => {
          return ((req.headers.origin && req.headers.origin.includes('://htmledit.squarefree.com')) ||
            (req.headers.referer && req.headers.referer.includes('://htmledit.squarefree.com'))) &&
            req.body.username !== user.username
        })
        user.update({ username: req.body.username }).then(newuser => {
          newuser = utils.queryResultToJson(newuser)
          const updatedToken = insecurity.authorize(newuser)
          insecurity.authenticatedUsers.put(updatedToken, newuser)
          res.cookie('token', updatedToken)
          res.location(process.env.BASE_PATH + '/profile')
          res.redirect(process.env.BASE_PATH + '/profile')
        })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
