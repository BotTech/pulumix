# Schema Generator

This Go tool generates JSON schemas from Pulumi's plan.go file by:

1. Cloning/updating the Pulumi repository
2. Discovering all v3.x.x tagged versions
3. For each version, generating a JSON schema using invopop/jsonschema
4. Saving the schema to `../schemas/plan/<version>/plan.json`

## Running

From the package root:

```bash
pnpm run generate
```

Or directly:

```bash
cd generator
go mod tidy
go run .
```

## Implementation Notes

- Uses a bare git clone for efficiency
- Only processes v3.x.x versions (configurable via `minorVersion` constant)
- Generates schemas from the `apitype.DeploymentPlanV1` type
- Handles versions where `plan.go` might not exist

## Known Issues

### json-schema-to-typescript Bug with Root-Level $ref (RESOLVED)

The `invopop/jsonschema` library generates schemas with a root-level `$ref` that points to `#/$defs/DeploymentPlanV1`,
and that definition contains properties with their own `$ref` values. This pattern causes
a bug in `json-schema-to-typescript` (the tool used to generate TypeScript types).

**The Problem:**

When a schema has:

1. A root-level `$ref` pointing to a definition (e.g., `"$ref": "#/$defs/DeploymentPlanV1"`)
2. That definition has properties with their own `$ref` values (e.g., `manifest: { "$ref": "#/$defs/ManifestV1" }`)

The `json-schema-to-typescript` tool incorrectly resolves nested refs, creating malformed
references like `#/%24defs/Root/properties/child` instead of `#/$defs/Child`.

**Testing:**

The issue was isolated through systematic testing in `test-schemas/`:

- Simple schemas: ✓ Work
- Schemas with `$defs` and `$ref`: ✓ Work
- Schemas with root-level `$ref` only: ✓ Work
- Schemas with root-level `$ref` AND nested `$ref` in properties: ✗ Fail

**Solution:**

The generator now includes a post-processing step (`flattenRootRef` function) that:

1. Detects if the schema has a root-level `$ref` pointing to a definition
2. Inlines that definition's properties at the root level
3. Removes the root-level `$ref`
4. Only removes the definition from `$defs` if no other references to it exist

This flattening happens automatically after schema generation, allowing `json-schema-to-typescript`
to process the schemas correctly without encountering the nested `$ref` bug.
