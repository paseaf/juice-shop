/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import * as server from '../server'

export default () => new Promise((resolve, reject) =>
  server.start(err => {
    if (err) {
      reject(err)
    }
    resolve()
  })
)
