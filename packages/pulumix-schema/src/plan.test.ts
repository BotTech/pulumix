import { describe, it, expect } from 'vitest'
import { getSchema, listVersions } from './plan.js'
import * as fs from 'fs'
import * as path from 'path'
import * as semver from 'semver'

describe('listVersions', () => {
  it('should return all available schema versions sorted in ascending order', () => {
    const versions = listVersions()

    expect(versions).toBeInstanceOf(Array)
    expect(versions.length).toBeGreaterThan(0)

    // All versions should start with 'v' and follow semver format
    for (const version of versions) {
      expect(version).toMatch(/^v\d+\.\d+\.\d+$/)
    }

    // Verify sorting using semver
    for (let i = 1; i < versions.length; i++) {
      const prev = versions[i - 1]!.slice(1) // Remove 'v' prefix
      const current = versions[i]!.slice(1)
      expect(semver.gte(current, prev)).toBe(true)
    }
  })

  it('should include expected versions', () => {
    const versions = listVersions()

    // Check for some known versions
    expect(versions).toContain('v3.24.0')
    expect(versions).toContain('v3.200.0')
  })
})

describe('getSchema', () => {
  it('should return schema for exact version match', () => {
    const schema = getSchema('v3.24.0')

    expect(schema).toBeDefined()
    expect(schema).toHaveProperty('$schema')
    expect(schema).toHaveProperty('title')
    expect(schema.title).toBe('Pulumi Deployment Plan')
  })

  it('should accept version without v prefix', () => {
    const schema = getSchema('3.24.0')

    expect(schema).toBeDefined()
    expect(schema).toHaveProperty('title')
    expect(schema.title).toBe('Pulumi Deployment Plan')
  })

  it('should return nearest lower version for version between releases', () => {
    // v3.24.0 and v3.35.0 exist, but v3.30.0 does not
    const schema = getSchema('v3.30.0')

    expect(schema).toBeDefined()

    // Should use v3.24.0 schema (the highest version <= v3.30.0)
    const schemaPath = path.join(__dirname, '..', 'schemas', 'plan', 'v3.24.0', 'plan.json')
    const expectedSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

    expect(schema).toEqual(expectedSchema)
  })

  it('should return latest available version for future version', () => {
    const schema = getSchema('v999.999.999')

    expect(schema).toBeDefined()

    // Should use the latest available schema
    const versions = listVersions()
    const latestVersion = versions[versions.length - 1]
    expect(latestVersion).toBeDefined()

    const schemaPath = path.join(__dirname, '..', 'schemas', 'plan', latestVersion!, 'plan.json')
    const expectedSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

    expect(schema).toEqual(expectedSchema)
  })

  it('should throw error for version older than any available schema', () => {
    expect(() => getSchema('v1.0.0')).toThrow(
      /No compatible schema found for version v1\.0\.0/
    )
  })

  it('should include available versions in error message', () => {
    try {
      getSchema('v1.0.0')
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      expect(error.message).toContain('Available versions:')
      expect(error.message).toContain('v3.24.0')
    }
  })

  it('should handle different patch versions correctly', () => {
    // Test that semver matching works correctly for patch versions
    const schema1 = getSchema('v3.24.5') // Between v3.24.0 and v3.35.0
    const schema2 = getSchema('v3.24.0')

    expect(schema1).toEqual(schema2)
  })

  it('should handle different minor versions correctly', () => {
    // Test that we get different schemas for different minor versions
    const schema1 = getSchema('v3.24.0')
    const schema2 = getSchema('v3.35.0')

    // Schemas should be defined but might be different
    expect(schema1).toBeDefined()
    expect(schema2).toBeDefined()
  })

  it('should parse JSON correctly and return object', () => {
    const schema = getSchema('v3.24.0')

    expect(typeof schema).toBe('object')
    expect(schema).not.toBeNull()
    expect(Array.isArray(schema)).toBe(false)
  })
})

describe('getSchema and listVersions integration', () => {
  it('should be able to get schema for all listed versions', () => {
    const versions = listVersions()

    for (const version of versions) {
      const schema = getSchema(version)
      expect(schema).toBeDefined()
      expect(schema).toHaveProperty('title')
    }
  })

  it('should work correctly with semver ranges', () => {
    const versions = listVersions()

    // Test getting schema for a version slightly above the minimum
    const minVersion = versions[0]
    expect(minVersion).toBeDefined()

    const [major, minor, patch] = minVersion!.slice(1).split('.').map(Number)
    const slightlyHigher = `v${major}.${minor}.${patch! + 1}`

    const schema = getSchema(slightlyHigher)
    expect(schema).toBeDefined()

    // Should get the schema for minVersion (highest version <= requested)
    const expectedSchemaPath = path.join(
      __dirname,
      '..',
      'schemas',
      'plan',
      minVersion!,
      'plan.json'
    )
    const expectedSchema = JSON.parse(fs.readFileSync(expectedSchemaPath, 'utf-8'))

    expect(schema).toEqual(expectedSchema)
  })
})
