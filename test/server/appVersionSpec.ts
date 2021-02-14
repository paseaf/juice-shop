/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
import retrieveAppVersion = require('../../routes/appVersion')
const expect = chai.expect
chai.use(sinonChai)

describe('appVersion', () => {
  it('should return version specified in package.json', () => {
    this.req = {}
    this.res = { json: sinon.spy() }

    retrieveAppVersion()(this.req, this.res)
    expect(this.res.json).to.have.been.calledWith({ version: require('../../package.json').version })
  })
})
