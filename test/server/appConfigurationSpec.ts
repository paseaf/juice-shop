/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
import retrieveAppConfiguration = require('../../routes/appConfiguration')
import configModule = require('config')
const expect = chai.expect
chai.use(sinonChai)

describe('appConfiguration', () => {
  it('should return configuration object', () => {
    this.req = {}
    this.res = { json: sinon.spy() }

    retrieveAppConfiguration()(this.req, this.res)
    expect(this.res.json).to.have.been.calledWith({ config: configModule })
  })
})
