/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

import retrieveAppVersion = require('../../routes/appVersion')
import { version } from '../../package.json'

describe('appVersion', () => {
  it('should return version specified in package.json', () => {
    this.req = {}
    this.res = { json: sinon.spy() }

    retrieveAppVersion()(this.req, this.res)
    expect(this.res.json).to.have.been.calledWith({ version: version })
  })
})
