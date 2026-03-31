#!/usr/bin/env node

const { CLAIM_SIGNER_ENV_NAME, registerClaimSigner } = require('./chronicle-testnet-common')

registerClaimSigner()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
  })
  .catch((error) => {
    if (!process.env[CLAIM_SIGNER_ENV_NAME]) {
      console.error(
        `${CLAIM_SIGNER_ENV_NAME} is missing. Configure it locally before registering the signer.`
      )
    }

    console.error(error)
    process.exit(1)
  })
