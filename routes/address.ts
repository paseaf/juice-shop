/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')

export function getAddress () {
  return async (req, res, next) => {
    const addresses = await models.Address.findAll({ where: { UserId: req.body.UserId } })
    res.status(200).json({ status: 'success', data: addresses })
  }
}

export function getAddressById () {
  return async (req, res, next) => {
    const address = await models.Address.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (address) {
      res.status(200).json({ status: 'success', data: address })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}

export function delAddressById () {
  return async (req, res, next) => {
    const address = await models.Address.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (address) {
      res.status(200).json({ status: 'success', data: 'Address deleted successfully.' })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}
