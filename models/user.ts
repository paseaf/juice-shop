/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import insecurity = require('../lib/insecurity')
import utils = require('../lib/utils')
import { challenges } from '../data/datacache'
import config = require('config')

export = (sequelize, { STRING, BOOLEAN }) => {
  const User = sequelize.define('User', {
    username: {
      type: STRING,
      defaultValue: '',
      set (username) {
        if (!utils.disableOnContainerEnv()) {
          username = insecurity.sanitizeLegacy(username)
        } else {
          username = insecurity.sanitizeSecure(username)
        }
        this.setDataValue('username', username)
      }
    },
    email: {
      type: STRING,
      unique: true,
      set (email) {
        if (!utils.disableOnContainerEnv()) {
          utils.solveIf(challenges.persistedXssUserChallenge, () => { return utils.contains(email, '<iframe src="javascript:alert(`xss`)">') })
        } else {
          email = insecurity.sanitizeSecure(email)
        }
        this.setDataValue('email', email)
      }
    },
    password: {
      type: STRING,
      set (clearTextPassword) {
        this.setDataValue('password', insecurity.hash(clearTextPassword))
      }
    },
    role: {
      type: STRING,
      defaultValue: 'customer',
      validate: {
        isIn: [['customer', 'deluxe', 'accounting', 'admin']]
      },
      set (role) {
        const profileImage = this.getDataValue('profileImage')
        if (role === insecurity.roles.admin && (!profileImage || profileImage === '/assets/public/images/uploads/default.svg')) {
          this.setDataValue('profileImage', '/assets/public/images/uploads/defaultAdmin.png')
        }
        this.setDataValue('role', role)
      }
    },
    deluxeToken: {
      type: STRING,
      defaultValue: ''
    },
    lastLoginIp: {
      type: STRING,
      defaultValue: '0.0.0.0'
    },
    profileImage: {
      type: STRING,
      defaultValue: '/assets/public/images/uploads/default.svg'
    },
    totpSecret: {
      type: STRING,
      defaultValue: ''
    },
    isActive: {
      type: BOOLEAN,
      defaultValue: true
    }
  }, { paranoid: true })

  User.addHook('afterValidate', (user) => {
    if (user.email && user.email.toLowerCase() === `acc0unt4nt@${config.get('application.domain')}`.toLowerCase()) {
      return Promise.reject(new Error('Nice try, but this is not how the "Ephemeral Accountant" challenge works!'))
    }
  })

  return User
}
