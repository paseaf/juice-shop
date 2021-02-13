/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import spawn = require('cross-spawn')
import colors = require('colors/safe')

let server, confName
import e2eSubfolderModule = require('./e2eSubfolder')
import serverModule = require('../server')
if (process.argv && process.argv.length >= 3 && process.argv[2] === 'subfolder') {
  server = e2eSubfolderModule
  confName = 'protractor.subfolder.conf.js'
} else {
  server = serverModule
  confName = 'protractor.conf.js'
}

server.start(() => {
  const protractor = spawn('protractor', [confName])
  function logToConsole (data) {
    console.log(String(data))
  }

  protractor.stdout.on('data', logToConsole)
  protractor.stderr.on('data', logToConsole)

  protractor.on('exit', exitCode => {
    console.log('Protractor exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
