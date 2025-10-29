/**
 * Example usage of @bottech/pulumix-schema
 */

import { getSchema, listVersions } from '@bottech/pulumix-schema'

// List all available schema versions
const versions = listVersions()
console.log('Available schema versions:', versions)

// Get the schema for a specific version
if (versions.length > 0) {
  const latestVersion = versions[versions.length - 1]
  console.log(`\nGetting schema for ${latestVersion}...`)
  
  const schema = getSchema(latestVersion)
  console.log('Schema:', JSON.stringify(schema, null, 2))
}
