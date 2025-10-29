/**
 * Type tests for version type mappings.
 * These tests verify that the DeploymentPlanForVersion type correctly maps version strings
 * to their corresponding plan types using semver logic.
 */

import { describe, expectTypeOf, test } from 'vitest'
import type {
  DeploymentPlanForVersion,
  DeploymentPlan_v3_24_0,
  DeploymentPlan_v3_35_0,
  DeploymentPlan_v3_38_0,
  DeploymentPlan_v3_40_1,
  DeploymentPlan_v3_43_0,
  DeploymentPlan_v3_95_0,
  DeploymentPlan_v3_132_0,
  DeploymentPlan_v3_200_0,
} from './plan.generated.js'

describe('DeploymentPlanForVersion', () => {
  describe('exact version matches', () => {
    test('v3.24.0 maps to v3.24.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.24.0'>>().toEqualTypeOf<DeploymentPlan_v3_24_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.24.0'>>().toEqualTypeOf<DeploymentPlan_v3_24_0>()
    })

    test('v3.35.0 maps to v3.35.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.35.0'>>().toEqualTypeOf<DeploymentPlan_v3_35_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.35.0'>>().toEqualTypeOf<DeploymentPlan_v3_35_0>()
    })

    test('v3.38.0 maps to v3.38.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.38.0'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.38.0'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
    })

    test('v3.40.1 maps to v3.40.1 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.40.1'>>().toEqualTypeOf<DeploymentPlan_v3_40_1>()
      expectTypeOf<DeploymentPlanForVersion<'3.40.1'>>().toEqualTypeOf<DeploymentPlan_v3_40_1>()
    })

    test('v3.43.0 maps to v3.43.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.43.0'>>().toEqualTypeOf<DeploymentPlan_v3_43_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.43.0'>>().toEqualTypeOf<DeploymentPlan_v3_43_0>()
    })

    test('v3.95.0 maps to v3.95.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.95.0'>>().toEqualTypeOf<DeploymentPlan_v3_95_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.95.0'>>().toEqualTypeOf<DeploymentPlan_v3_95_0>()
    })

    test('v3.132.0 maps to v3.132.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.132.0'>>().toEqualTypeOf<DeploymentPlan_v3_132_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.132.0'>>().toEqualTypeOf<DeploymentPlan_v3_132_0>()
    })

    test('v3.200.0 maps to v3.200.0 plan type', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.200.0'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.200.0'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
    })
  })

  describe('versions with semver matching behavior', () => {
    test('v2.1.5 returns never (unsupported major version)', () => {
      // Major version 2 is not in MajorVersionMap, returns never
      expectTypeOf<DeploymentPlanForVersion<'v2.1.5'>>().toEqualTypeOf<never>()
      expectTypeOf<DeploymentPlanForVersion<'2.1.5'>>().toEqualTypeOf<never>()
    })

    test('v3.1.2 returns never (below minimum minor version)', () => {
      // Minor version 1 maps to never
      expectTypeOf<DeploymentPlanForVersion<'v3.1.2'>>().toEqualTypeOf<never>()
      expectTypeOf<DeploymentPlanForVersion<'3.1.2'>>().toEqualTypeOf<never>()
    })

    test('v3.23.9 returns never (just below minimum)', () => {
      // Minor version 23 maps to never
      expectTypeOf<DeploymentPlanForVersion<'v3.23.9'>>().toEqualTypeOf<never>()
      expectTypeOf<DeploymentPlanForVersion<'3.23.9'>>().toEqualTypeOf<never>()
    })
  })

  describe('semver max matching logic', () => {
    test('v3.36.0 uses v3.35.0 (previous known minor version)', () => {
      // Minor 36 maps to PatchVersionMap_3_35 (previous version)
      expectTypeOf<DeploymentPlanForVersion<'v3.36.0'>>().toEqualTypeOf<DeploymentPlan_v3_35_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.36.0'>>().toEqualTypeOf<DeploymentPlan_v3_35_0>()
    })

    test('v3.38.2 uses v3.38.0 (patch version default to max in minor)', () => {
      // Patch 2 doesn't exist, falls back to max patch in that minor version
      expectTypeOf<DeploymentPlanForVersion<'v3.38.2'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.38.2'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
    })

    test('v3.40.0 falls back to previous (no patch 0, only 3.40.1 exists)', () => {
      // Patch 0 explicitly maps to never in PatchVersionMap_3_40, falls back to previous version
      expectTypeOf<DeploymentPlanForVersion<'v3.40.0'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.40.0'>>().toEqualTypeOf<DeploymentPlan_v3_38_0>()
    })

    test('v3.40.2 falls back to previous (max known patch for minor 40)', () => {
      // Patch 2 doesn't exist, falls back to previous patch
      expectTypeOf<DeploymentPlanForVersion<'v3.40.2'>>().toEqualTypeOf<DeploymentPlan_v3_40_1>()
      expectTypeOf<DeploymentPlanForVersion<'3.40.2'>>().toEqualTypeOf<DeploymentPlan_v3_40_1>()
    })

    test('v3.300.0 uses v3.200.0 (max known minor version)', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.300.0'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.300.0'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
    })

    test('v4.1.2 uses v3.200.0 (max known major version)', () => {
      expectTypeOf<DeploymentPlanForVersion<'v4.1.2'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
      expectTypeOf<DeploymentPlanForVersion<'4.1.2'>>().toEqualTypeOf<DeploymentPlan_v3_200_0>()
    })
  })

  describe('version strings with suffixes', () => {
    test('v3.132.0-alpha maps to v3.132.0', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.132.0-alpha'>>().toEqualTypeOf<DeploymentPlan_v3_132_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.132.0-alpha'>>().toEqualTypeOf<DeploymentPlan_v3_132_0>()
    })

    test('v3.24.0+build123 maps to v3.24.0', () => {
      expectTypeOf<DeploymentPlanForVersion<'v3.24.0+build123'>>().toEqualTypeOf<DeploymentPlan_v3_24_0>()
      expectTypeOf<DeploymentPlanForVersion<'3.24.0+build123'>>().toEqualTypeOf<DeploymentPlan_v3_24_0>()
    })

  })

  describe('invalid version strings return never', () => {
    test('invalid string returns never', () => {
      expectTypeOf<DeploymentPlanForVersion<'invalid'>>().toEqualTypeOf<never>()
    })

    test('partial version with x returns never', () => {
      expectTypeOf<DeploymentPlanForVersion<'3.x'>>().toEqualTypeOf<never>()
    })

    test('empty string returns never', () => {
      expectTypeOf<DeploymentPlanForVersion<''>>().toEqualTypeOf<never>()
    })

    test('version with invalid suffix returns never', () => {
      expectTypeOf<DeploymentPlanForVersion<'3.43.0invalid'>>().toEqualTypeOf<never>()
    })
  })
})
