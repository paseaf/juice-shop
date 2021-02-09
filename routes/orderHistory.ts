/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import insecurity = require('../lib/insecurity')
import db = require('../data/mongodb')

export function orderHistory () {
  return async (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.headers.authorization.replace('Bearer ', ''))
    if (loggedInUser && loggedInUser.data && loggedInUser.data.email && loggedInUser.data.id) {
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const orders = await db.orders.find({ email: updatedEmail })
      res.status(200).json({ status: 'success', data: orders })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}

export function allOrders () {
  return async (req, res, next) => {
    const orders = await db.orders.find()
    res.status(200).json({ status: 'success', data: orders.reverse() })
  }
}

export function toggleDeliveryStatus () {
  return async (req, res, next) => {
    const deliveryStatus = !req.body.deliveryStatus
    const eta = deliveryStatus ? '0' : '1'
    await db.orders.update({ _id: req.params.id }, { $set: { delivered: deliveryStatus, eta: eta } })
    res.status(200).json({ status: 'success' })
  }
}
