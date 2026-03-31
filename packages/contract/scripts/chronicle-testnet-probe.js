#!/usr/bin/env node

const { buildProbeSnapshot } = require('./chronicle-testnet-common')

buildProbeSnapshot()
  .then((snapshot) => {
    console.log(JSON.stringify(snapshot, null, 2))
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
