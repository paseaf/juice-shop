/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import db = require('../data/mongodb')
import utils = require('../lib/utils')
import { challenges } from '../data/datacache'
import insecurity = require('../lib/insecurity')

export = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    utils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data.email !== req.body.author })
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author,
      likesCount: 0,
      likedBy: []
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
