/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
import {challenges} from "../data/datacache";

module.exports = (sequelize, { STRING, DECIMAL }) => {
  const Product = sequelize.define('Product', {
    name: STRING,
    description: {
      type: STRING,
      set (description) {
        if (!utils.disableOnContainerEnv()) {
          utils.solveIf(challenges.restfulXssChallenge, () => { return utils.contains(description, '<iframe src="javascript:alert(`xss`)">') })
        } else {
          description = insecurity.sanitizeSecure(description)
        }
        this.setDataValue('description', description)
      }
    },
    price: DECIMAL,
    deluxePrice: DECIMAL,
    image: STRING
  }, { paranoid: true })

  Product.associate = ({ Basket, BasketItem }) => {
    Product.belongsToMany(Basket, { through: BasketItem, foreignKey: { name: 'ProductId', noUpdate: true } })
  }

  return Product
}
