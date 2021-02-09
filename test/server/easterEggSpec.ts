/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

import serveEasterEgg = require('../../routes/easterEgg')
import { challenges } from '../../data/datacache'

describe('easterEgg', () => {
  beforeEach(() => {
    this.res = { sendFile: sinon.spy() }
    this.req = {}
    this.save = () => ({
      then () { }
    })
  })

  it('should serve /frontend/dist/frontend/assets/private/threejs-demo.html', () => {
    serveEasterEgg()(this.req, this.res)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]threejs-demo\.html/))
  })

  it('should solve "easterEggLevelTwoChallenge"', () => {
    challenges.easterEggLevelTwoChallenge = { solved: false, save: this.save }

    serveEasterEgg()(this.req, this.res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
