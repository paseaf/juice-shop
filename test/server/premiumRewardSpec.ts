/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

import servePremiumContent = require('../../routes/premiumReward')
import { challenges } from '../../data/datacache'

describe('premiumReward', () => {
  beforeEach(() => {
    this.res = { sendFile: sinon.spy() }
    this.req = {}
    this.save = () => ({
      then () { }
    })
  })

  it('should serve /frontend/dist/frontend/assets/private/JuiceShop_Wallpaper_1920x1080_VR.jpg', () => {
    servePremiumContent()(this.req, this.res)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]JuiceShop_Wallpaper_1920x1080_VR\.jpg/))
  })

  it('should solve "premiumPaywallChallenge"', () => {
    challenges.premiumPaywallChallenge = { solved: false, save: this.save }

    servePremiumContent()(this.req, this.res)

    expect(challenges.premiumPaywallChallenge.solved).to.equal(true)
  })
})
