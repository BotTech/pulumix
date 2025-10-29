import { execSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const schemasDir = join(import.meta.dirname, '..', 'schemas', 'plan')

// Find all schema directories
const versions = readdirSync(schemasDir).filter((name) => {
  const fullPath = join(schemasDir, name)
  return statSync(fullPath).isDirectory()
})

console.log(`Found ${versions.length} schema versions to process`)

// Generate TypeScript types for each schema
for (const version of versions) {
  const schemaPath = join(schemasDir, version, 'plan.json')
  const outputPath = join(schemasDir, version, 'plan.d.ts')

  console.log(`Generating types for ${version}...`)

  try {
    execSync(
      `npx json-schema-to-typescript --input "${schemaPath}" --output "${outputPath}" --bannerComment "" --unreachableDefinitions --$refOptions.resolve.external false`,
      { stdio: 'inherit' }
    )
  } catch (error) {
    console.error(`Failed to generate types for ${version}:`, error)
    process.exit(1)
  }
}

console.log('✓ TypeScript types generated successfully')
