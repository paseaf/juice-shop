/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
import validateDependencies = require('./lib/startup/validateDependencies')
validateDependencies().then(() => {
  const server = require('./server')
  server.start()
})
