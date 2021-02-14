/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

import fs = require('fs')
import { safeLoad } from 'js-yaml'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)
import path = require('path')

const loadYamlFile = async (filename) => {
  const contents = await readFile(filename, { encoding: 'utf8' })
  return safeLoad(contents)
}

describe('challengeTutorialSequence', () => {
  let challenges
  before(async () => {
    challenges = await loadYamlFile(path.join(__dirname, '../../data/static/challenges.yml'))
  })

  it('should have unique tutorial orders', async () => {
    const tutorialOrderCounts = {}

    for (const { tutorial } of challenges) {
      if (tutorial) {
        const order = tutorial.order
        if (!Object.prototype.hasOwnProperty.call(tutorialOrderCounts, order)) {
          tutorialOrderCounts[order] = 0
        }
        tutorialOrderCounts[order]++
      }
    }

    for (const order of Object.keys(tutorialOrderCounts)) {
      const count = tutorialOrderCounts[order]

      expect(count, `Tutorial order "${order}" is used for multiple challenges.`).to.equal(1)
    }
  })
})
