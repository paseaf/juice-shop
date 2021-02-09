/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import insecurity = require('../lib/insecurity')

export = function erasureRequest () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.from(req)
    if (loggedInUser) {
      const userData = {
        UserId: loggedInUser.data.id,
        deletionRequested: true
      }
      models.PrivacyRequest.create(userData).then(() => {
        res.status(202).send()
      }).catch((err) => {
        next(err)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
