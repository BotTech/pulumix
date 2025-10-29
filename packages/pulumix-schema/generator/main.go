package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const (
	pulumiRepo    = "https://github.com/pulumi/pulumi.git"
	planGoPath    = "sdk/go/common/apitype/plan.go"
	outputDir     = "../schemas"
	tempRepoDir   = ".pulumi-repo"
	tempModuleDir = ".temp-module"
	minorVersion  = 3 // We're interested in v3.x.x versions
)

// Version represents a semantic version with comparison capabilities
type Version struct {
	Original   string
	Major      int
	Minor      int
	Patch      int
	CommitHash string
	FileHash   string // Hash of plan.go content at this version
}

// parseVersion parses a version string like "v3.112.0" into a Version struct
func parseVersion(versionStr string) (*Version, error) {
	re := regexp.MustCompile(`^v(\d+)\.(\d+)\.(\d+)`)
	matches := re.FindStringSubmatch(versionStr)
	if matches == nil {
		return nil, fmt.Errorf("invalid version format: %s", versionStr)
	}

	var v Version
	v.Original = versionStr
	fmt.Sscanf(matches[1], "%d", &v.Major)
	fmt.Sscanf(matches[2], "%d", &v.Minor)
	fmt.Sscanf(matches[3], "%d", &v.Patch)

	return &v, nil
}

// Less compares two versions
func (v *Version) Less(other *Version) bool {
	if v.Major != other.Major {
		return v.Major < other.Major
	}
	if v.Minor != other.Minor {
		return v.Minor < other.Minor
	}
	return v.Patch < other.Patch
}

// flattenRootRef flattens a root-level $ref in the schema to work around
// json-schema-to-typescript bug with nested refs.
// If the schema has a root $ref like "#/$defs/SomeType", this function will:
// 1. Inline the referenced definition at the root level
// 2. Remove the root $ref
// 3. Only remove the definition from $defs if no other $refs point to it
func flattenRootRef(schemaJSON []byte) ([]byte, error) {
	var schema map[string]interface{}
	if err := json.Unmarshal(schemaJSON, &schema); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schema: %w", err)
	}

	// Check if there's a root-level $ref
	rootRef, hasRootRef := schema["$ref"].(string)
	if !hasRootRef {
		// No root ref, return as-is
		return schemaJSON, nil
	}

	// Parse the reference (expecting "#/$defs/TypeName")
	if !strings.HasPrefix(rootRef, "#/$defs/") {
		// Not the pattern we're looking for, return as-is
		return schemaJSON, nil
	}

	defName := strings.TrimPrefix(rootRef, "#/$defs/")

	// Get the $defs object
	defs, hasDefs := schema["$defs"].(map[string]interface{})
	if !hasDefs {
		return nil, fmt.Errorf("schema has $ref but no $defs")
	}

	// Get the referenced definition
	def, hasDef := defs[defName]
	if !hasDef {
		return nil, fmt.Errorf("referenced definition %s not found in $defs", defName)
	}

	// Inline the definition at root level
	defMap, ok := def.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("definition %s is not an object", defName)
	}

	// Copy all properties from the definition to the root
	for key, value := range defMap {
		schema[key] = value
	}

	// Remove the root $ref
	delete(schema, "$ref")

	// Check if the definition is referenced elsewhere in the schema
	if !isDefinitionReferenced(schema, defName, "") {
		// Safe to remove the definition
		delete(defs, defName)
	}

	// Marshal back to JSON
	result, err := json.MarshalIndent(schema, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal flattened schema: %w", err)
	}

	return result, nil
}

// isDefinitionReferenced recursively checks if a definition is referenced anywhere in the schema
// except at the root level (which we're removing)
func isDefinitionReferenced(obj interface{}, defName string, path string) bool {
	targetRef := "#/$defs/" + defName

	switch v := obj.(type) {
	case map[string]interface{}:
		for key, value := range v {
			currentPath := path + "/" + key

			// Check if this is a $ref pointing to our definition
			if key == "$ref" {
				if refStr, ok := value.(string); ok {
					// Skip root-level $ref (empty path or just "/$ref")
					if path != "" && path != "/$ref" && refStr == targetRef {
						return true
					}
				}
			}

			// Recursively check nested objects
			if isDefinitionReferenced(value, defName, currentPath) {
				return true
			}
		}
	case []interface{}:
		for i, item := range v {
			currentPath := fmt.Sprintf("%s[%d]", path, i)
			if isDefinitionReferenced(item, defName, currentPath) {
				return true
			}
		}
	}

	return false
}

func main() {
	fmt.Println("Pulumi Plan Schema Generator")
	fmt.Println("============================")

	// Step 1: Clone or update the Pulumi repository
	if err := ensureRepository(); err != nil {
		fmt.Fprintf(os.Stderr, "Error ensuring repository: %v\n", err)
		os.Exit(1)
	}

	// Step 2: Get all tagged versions with file change tracking
	versions, err := getVersionsWithFileChanges()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error getting versions with file changes: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Found %d unique file versions to process (out of all v3 tags)\n", len(versions))

	// Step 3: Generate schema for each unique version
	successCount := 0
	for _, version := range versions {
		fmt.Printf("Processing %s (file hash: %.8s)...\n", version.Original, version.FileHash)
		if err := generateSchemaForVersion(version); err != nil {
			fmt.Fprintf(os.Stderr, "  Warning: Failed to generate schema for %s: %v\n", version.Original, err)
			continue
		}
		successCount++
		fmt.Printf("  ✓ Generated schema for %s\n", version.Original)
	}

	fmt.Printf("\nCompleted: %d/%d schemas generated successfully\n", successCount, len(versions))
}

// ensureRepository clones or updates the Pulumi repository
func ensureRepository() error {
	if _, err := os.Stat(tempRepoDir); os.IsNotExist(err) {
		fmt.Println("Cloning Pulumi repository...")
		cmd := exec.Command("git", "clone", "--bare", pulumiRepo, tempRepoDir)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	}

	fmt.Println("Updating Pulumi repository...")
	cmd := exec.Command("git", "-C", tempRepoDir, "fetch", "--tags", "origin")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// getTaggedVersions returns all tagged versions from the repository
func getTaggedVersions() ([]*Version, error) {
	cmd := exec.Command("git", "-C", tempRepoDir, "tag", "-l", "v*")
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to list tags: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var versions []*Version

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		version, err := parseVersion(line)
		if err != nil {
			continue // Skip invalid versions
		}

		// Only include v3.x.x versions
		if version.Major == minorVersion {
			versions = append(versions, version)
		}
	}

	// Sort versions
	sort.Slice(versions, func(i, j int) bool {
		return versions[i].Less(versions[j])
	})

	return versions, nil
}

// getVersionsWithFileChanges returns only versions where plan.go actually changed
func getVersionsWithFileChanges() ([]*Version, error) {
	// Get all v3 tagged versions
	allVersions, err := getTaggedVersions()
	if err != nil {
		return nil, err
	}

	var uniqueVersions []*Version
	seenHashes := make(map[string]bool)

	for _, version := range allVersions {
		// Get the file content at this tag
		fileContent, err := getFileContentAtTag(version.Original, planGoPath)
		if err != nil {
			// File doesn't exist at this version, skip
			continue
		}

		// Calculate hash of file content
		hash := sha256.Sum256([]byte(fileContent))
		fileHash := hex.EncodeToString(hash[:])

		// Only include if we haven't seen this file content before
		if !seenHashes[fileHash] {
			version.FileHash = fileHash
			uniqueVersions = append(uniqueVersions, version)
			seenHashes[fileHash] = true
		}
	}

	return uniqueVersions, nil
}

// getFileContentAtTag retrieves file content at a specific git tag
func getFileContentAtTag(tag, filePath string) (string, error) {
	cmd := exec.Command("git", "-C", tempRepoDir, "show", fmt.Sprintf("%s:%s", tag, filePath))
	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get file content: %w", err)
	}
	return string(output), nil
}

// generateSchemaForVersion generates a JSON schema for a specific version
func generateSchemaForVersion(version *Version) error {
	// Create output directory for this version: schemas/plan/{version}/
	versionDir := filepath.Join(outputDir, "plan", version.Original)
	if err := os.MkdirAll(versionDir, 0755); err != nil {
		return fmt.Errorf("failed to create version directory: %w", err)
	}

	// Create a temporary module directory for this version
	tempModule := filepath.Join(tempModuleDir, version.Original)
	if err := os.RemoveAll(tempModule); err != nil {
		return fmt.Errorf("failed to clean temp module directory: %w", err)
	}
	if err := os.MkdirAll(tempModule, 0755); err != nil {
		return fmt.Errorf("failed to create temp module directory: %w", err)
	}
	defer os.RemoveAll(tempModule)

	// Create a go.mod file with the specific version
	goModContent := fmt.Sprintf(`module temp-schema-gen

go 1.23

require (
	github.com/invopop/jsonschema v0.13.0
	github.com/pulumi/pulumi/sdk/v3 %s
)
`, version.Original)

	if err := os.WriteFile(filepath.Join(tempModule, "go.mod"), []byte(goModContent), 0644); err != nil {
		return fmt.Errorf("failed to write go.mod: %w", err)
	}

	// Create the schema generation program
	genProgram := `package main

import (
	"encoding/json"
	"os"
	
	"github.com/invopop/jsonschema"
	"github.com/pulumi/pulumi/sdk/v3/go/common/apitype"
)

func main() {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            false,
	}

	schema := reflector.Reflect(&apitype.DeploymentPlanV1{})
	schema.Title = "Pulumi Deployment Plan"
	schema.Description = "JSON schema for Pulumi deployment plan types"

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(schema); err != nil {
		panic(err)
	}
}
`

	if err := os.WriteFile(filepath.Join(tempModule, "main.go"), []byte(genProgram), 0644); err != nil {
		return fmt.Errorf("failed to write generation program: %w", err)
	}

	// Run go mod tidy to download dependencies
	tidyCmd := exec.Command("go", "mod", "tidy")
	tidyCmd.Dir = tempModule
	if output, err := tidyCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to run go mod tidy: %w\nOutput: %s", err, string(output))
	}

	// Run the program to generate the schema
	runCmd := exec.Command("go", "run", "main.go")
	runCmd.Dir = tempModule
	schemaJSON, err := runCmd.Output()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return fmt.Errorf("failed to generate schema: %w\nStderr: %s", err, string(exitErr.Stderr))
		}
		return fmt.Errorf("failed to generate schema: %w", err)
	}

	// Flatten the schema to work around json-schema-to-typescript bug
	flattenedSchema, err := flattenRootRef(schemaJSON)
	if err != nil {
		return fmt.Errorf("failed to flatten schema: %w", err)
	}

	// Write schema to file
	schemaPath := filepath.Join(versionDir, "plan.json")
	if err := os.WriteFile(schemaPath, flattenedSchema, 0644); err != nil {
		return fmt.Errorf("failed to write schema file: %w", err)
	}

	// Also write metadata about this version
	metadata := map[string]string{
		"version":  version.Original,
		"fileHash": version.FileHash,
	}
	metadataJSON, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	metadataPath := filepath.Join(versionDir, "metadata.json")
	if err := os.WriteFile(metadataPath, metadataJSON, 0644); err != nil {
		return fmt.Errorf("failed to write metadata file: %w", err)
	}

	return nil
}
