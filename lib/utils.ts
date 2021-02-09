/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import fs = require('fs')
import colors = require('colors/safe')
import { notifications, challenges } from '../data/datacache'
import packageJson = require('../package.json')
import sanitizeHtml = require('sanitize-html')
import jsSHA = require('jssha')
import { AllHtmlEntities as Entities } from 'html-entities'
import config = require('config')
const entities = new Entities()
import download = require('download')
import crypto = require('crypto')
import clarinet = require('clarinet')
import isDocker = require('is-docker')
import isHeroku = require('is-heroku')
import isWindows = require('is-windows')
import logger = require('../lib/logger')
import webhook = require('../lib/webhook')

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let ctfKey
if (process.env.CTF_KEY !== undefined && process.env.CTF_KEY !== '') {
  ctfKey = process.env.CTF_KEY
} else {
  fs.readFile('ctf.key', 'utf8', (err, data) => {
    if (err) {
      throw err
    }
    ctfKey = data
  })
}

export const queryResultToJson = (data, status) => {
  let wrappedData = {}
  if (data) {
    if (!data.length && data.dataValues) {
      wrappedData = data.dataValues
    } else if (data.length > 0) {
      wrappedData = []
      for (let i = 0; i < data.length; i++) {
        wrappedData.push(data[i] && data[i].dataValues ? data[i].dataValues : data[i])
      }
    } else {
      wrappedData = data
    }
  }
  return {
    status: status || 'success',
    data: wrappedData
  }
}

export const startsWith = (str, prefix) => str ? str.indexOf(prefix) === 0 : false

export const endsWith = (str, suffix) => str ? str.indexOf(suffix, str.length - suffix.length) !== -1 : false

export const contains = (str, element) => str ? str.includes(element) : false

export const containsEscaped = function (str, element) {
  return this.contains(str, element.replace(/"/g, '\\"'))
}

export const containsOrEscaped = function (str, element) {
  return this.contains(str, element) || this.containsEscaped(str, element)
}

export const unquote = function (str) {
  if (str && this.startsWith(str, '"') && this.endsWith(str, '"')) {
    return str.substring(1, str.length - 1)
  } else {
    return str
  }
}

export const trunc = function (str, length) {
  str = str.replace(/(\r\n|\n|\r)/gm, '')
  return (str.length > length) ? str.substr(0, length - 1) + '...' : str
}

export const version = module => {
  if (module) {
    return packageJson.dependencies[module]
  } else {
    return packageJson.version
  }
}

export const ctfFlag = text => {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(ctfKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

export const solveIf = function (challenge, criteria, isRestore) {
  if (this.notSolved(challenge) && criteria()) {
    this.solve(challenge, isRestore)
  }
}

export const solve = function (challenge, isRestore) {
  const self = this
  challenge.solved = true
  challenge.save().then(solvedChallenge => {
    solvedChallenge.description = entities.decode(sanitizeHtml(solvedChallenge.description, {
      allowedTags: [],
      allowedAttributes: []
    }))
    logger.info(colors.green('Solved') + ' challenge ' + colors.cyan(solvedChallenge.name) + ' (' + solvedChallenge.description + ')')
    self.sendNotification(solvedChallenge, isRestore)
    if (process.env.SOLUTIONS_WEBHOOK && !isRestore) {
      webhook.notify(solvedChallenge).catch((error) => {
        logger.error('Webhook notification failed: ' + colors.red(error.message))
      })
    }
  })
}

export const sendNotification = function (challenge, isRestore) {
  if (!this.notSolved(challenge)) {
    const flag = this.ctfFlag(challenge.name)
    const notification = {
      key: challenge.key,
      name: challenge.name,
      challenge: challenge.name + ' (' + challenge.description + ')',
      flag: flag,
      hidden: !config.get('challenges.showSolvedNotifications'),
      isRestore: isRestore
    }
    const wasPreviouslyShown = notifications.find(({ key }) => key === challenge.key) !== undefined
    notifications.push(notification)

    if (global.io && (isRestore || !wasPreviouslyShown)) {
      global.io.emit('challenge solved', notification)
    }
  }
}

export const notSolved = challenge => challenge && !challenge.solved

export const findChallenge = challengeName => {
  for (const name in challenges) {
    if (Object.prototype.hasOwnProperty.call(challenges, name)) {
      if (challenges[name].name === challengeName) {
        return challenges[name]
      }
    }
  }
  logger.warn('Missing challenge with name: ' + challengeName)
}

export const toMMMYY = date => {
  const month = date.getMonth()
  const year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}

export const toISO8601 = date => {
  let day = '' + date.getDate()
  let month = '' + (date.getMonth() + 1)
  const year = date.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

export const extractFilename = (url) => {
  let file = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1))
  if (this.contains(file, '?')) {
    file = file.substring(0, file.indexOf('?'))
  }
  return file
}

export const downloadToFile = async (url, dest) => {
  return download(url).then(data => {
    fs.writeFileSync(dest, data)
  }).catch(err => {
    logger.warn('Failed to download ' + url + ' (' + err.statusMessage + ')')
  })
}

export const jwtFrom = ({ headers }) => {
  if (headers && headers.authorization) {
    const parts = headers.authorization.split(' ')
    if (parts.length === 2) {
      const scheme = parts[0]
      const token = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        return token
      }
    }
  }
  return undefined
}

export const randomHexString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

export const disableOnContainerEnv = () => {
  return (isDocker() || isHeroku) && !config.get('challenges.safetyOverride')
}

export const disableOnWindowsEnv = () => {
  return isWindows()
}

export const determineDisabledEnv = (disabledEnv) => {
  if (isDocker()) {
    return disabledEnv && (disabledEnv === 'Docker' || disabledEnv.includes('Docker')) ? 'Docker' : null
  } else if (isHeroku) {
    return disabledEnv && (disabledEnv === 'Heroku' || disabledEnv.includes('Heroku')) ? 'Heroku' : null
  } else if (isWindows()) {
    return disabledEnv && (disabledEnv === 'Windows' || disabledEnv.includes('Windows')) ? 'Windows' : null
  }
  return null
}

export const parseJsonCustom = (jsonString) => {
  const parser = clarinet.parser()
  const result = []
  parser.onkey = parser.onopenobject = k => {
    result.push({ key: k, value: null })
  }
  parser.onvalue = v => {
    result[result.length - 1].value = v
  }
  parser.write(jsonString).close()
  return result
}

export const toSimpleIpAddress = (ipv6) => {
  if (this.startsWith(ipv6, '::ffff:')) {
    return ipv6.substr(7)
  } else if (ipv6 === '::1') {
    return '127.0.0.1'
  } else {
    return ipv6
  }
}

export const thaw = (frozenObject) => {
  return JSON.parse(JSON.stringify(frozenObject))
}
