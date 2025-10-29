/**
 * Plan validation utilities with type-safe version mapping.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as semver from 'semver'
import type { Version } from './plan.generated.js'

export type * from './plan.generated.js'

/**
 * Get the JSON schema for a specific Pulumi plan version.
 * Uses semver to find the highest schema version that is less than or equal to the requested version.
 *
 * @param version - The Pulumi version (e.g., "v3.112.0" or "3.112.0")
 * @returns The JSON schema object
 * @throws Error if no compatible schema version is found
 */
export function getSchema(version: string): any {
  // Normalize version (remove 'v' prefix if present)
  const normalizedVersion = version.startsWith('v') ? version.slice(1) : version

  // Get all available schema versions
  const availableVersions = listVersions()

  if (availableVersions.length === 0) {
    throw new Error('No schema versions available')
  }

  // Convert version strings to semver format (remove 'v' prefix)
  const availableSemvers = availableVersions.map((v) => (v.startsWith('v') ? v.slice(1) : v))

  // Find the highest version that satisfies "<= requested version"
  const matchingVersion = semver.maxSatisfying(availableSemvers, `<=${normalizedVersion}`)

  if (!matchingVersion) {
    throw new Error(
      `No compatible schema found for version ${version}. ` +
        `Available versions: ${availableVersions.join(', ')}`
    )
  }

  // Convert back to original format with 'v' prefix
  const schemaVersion =
    availableVersions.find((v) => (v.startsWith('v') ? v.slice(1) : v) === matchingVersion) ||
    `v${matchingVersion}`

  const schemaPath = path.join(__dirname, '..', 'schemas', 'plan', schemaVersion, 'plan.json')
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  return JSON.parse(schemaContent)
}

/**
 * List all available plan schema versions.
 *
 * @returns Array of version strings (sorted in ascending order)
 */
export function listVersions(): Version[] {
  const schemasDir = path.join(__dirname, '..', 'schemas', 'plan')
  if (!fs.existsSync(schemasDir)) {
    return []
  }

  const versions = fs.readdirSync(schemasDir).filter((file) => {
    const stat = fs.statSync(path.join(schemasDir, file))
    return stat.isDirectory()
  }) as Version[]

  // Sort versions using semver
  return versions.sort((a, b) => {
    const aSemver = a.startsWith('v') ? a.slice(1) : a
    const bSemver = b.startsWith('v') ? b.slice(1) : b
    return semver.compare(aSemver, bSemver)
  })
}
