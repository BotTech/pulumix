#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * This script fixes a bug in json-schema-to-typescript where it can't handle
 * schemas that have both:
 * 1. A root-level $ref pointing to a definition
 * 2. That definition containing properties with their own $ref values
 * 
 * The fix is to inline the root definition into the schema root.
 */

interface Schema {
  $schema?: string
  $id?: string
  $ref?: string
  $defs?: Record<string, any>
  title?: string
  description?: string
  [key: string]: any
}

function fixSchema(schemaPath: string): void {
  console.log(`Fixing ${schemaPath}...`)
  
  const content = readFileSync(schemaPath, 'utf-8')
  const schema: Schema = JSON.parse(content)
  
  // Check if this schema has the problematic pattern
  if (!schema.$ref || !schema.$defs) {
    console.log('  No root $ref or $defs, skipping')
    return
  }
  
  // Extract the reference (e.g., "#/$defs/DeploymentPlanV1" -> "DeploymentPlanV1")
  const refMatch = schema.$ref.match(/^#\/\$defs\/(.+)$/)
  if (!refMatch) {
    console.log('  $ref is not a simple $defs reference, skipping')
    return
  }
  
  const refName = refMatch[1]
  const referencedDef = schema.$defs[refName]
  
  if (!referencedDef) {
    console.log(`  Warning: Referenced definition "${refName}" not found`)
    return
  }
  
  // Check if the referenced definition has nested $refs
  const hasNestedRefs = JSON.stringify(referencedDef).includes('"$ref"')
  
  if (!hasNestedRefs) {
    console.log('  No nested $refs in root definition, skipping')
    return
  }
  
  console.log(`  Found problematic pattern: root $ref to "${refName}" with nested $refs`)
  console.log('  Inlining root definition...')
  
  // Create the fixed schema by inlining the referenced definition
  const fixedSchema: Schema = {
    $schema: schema.$schema,
    ...(schema.$id && { $id: schema.$id }),
    ...(schema.title && { title: schema.title }),
    ...(schema.description && { description: schema.description }),
    ...referencedDef,
    $defs: schema.$defs,
  }
  
  // Write back
  writeFileSync(schemaPath, JSON.stringify(fixedSchema, null, 2) + '\n', 'utf-8')
  console.log('  ✓ Fixed')
}

// Fix all schema versions
const schemasDir = join(import.meta.dirname, '..', 'schemas', 'plan')
const versions = ['v3.132.0', 'v3.200.0', 'v3.24.0', 'v3.35.0', 'v3.38.0', 'v3.40.1', 'v3.43.0', 'v3.95.0']

for (const version of versions) {
  const schemaPath = join(schemasDir, version, 'plan.json')
  fixSchema(schemaPath)
}

console.log('\n✓ All schemas fixed')
