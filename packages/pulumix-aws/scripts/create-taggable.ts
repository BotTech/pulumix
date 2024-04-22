import * as path from "path";
import {
  ClassDeclaration,
  ExpressionStatement,
  Identifier,
  Node,
  ParameterDeclaration,
  Project,
  ScriptKind,
  SourceFile,
  StructureKind,
  SyntaxKind,
  ts,
  Type,
  VariableDeclarationKind,
} from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  //skipAddingFilesFromTsConfig: true,
  compilerOptions: {
    allowJs: true,
    //   allowImportingTsExtensions: false,
    checkJs: true,
    //   module: ModuleKind.CommonJS,
    //   moduleResolution: ModuleResolutionKind.NodeNext,
    //   skipLibCheck: true
  },
  // skipAddingFilesFromTsConfig: true,
});

const tempSourceFile = project.createSourceFile(
  "temp",
  `
  import * as pulumi from "@pulumi/pulumi"; 
  declare const tags: pulumi.Input<{[key: string]: pulumi.Input<string>;}>;
  `,
  { scriptKind: ScriptKind.TS },
);
const expectedTagsType = tempSourceFile
  .getVariableDeclarationOrThrow("tags")
  .getType();

// noinspection JSIgnoredPromiseFromCall
tempSourceFile.deleteImmediately();

function resolveModulePath(name: string): string {
  const module = ts.resolveModuleName(
    name,
    __filename,
    {
      ...project.compilerOptions.get(),
    },
    {
      ...project.getModuleResolutionHost(),
      trace: console.trace,
    },
  );
  if (module.resolvedModule === undefined) {
    throw `Unable to resolve module ${name}`;
  }
  return module.resolvedModule.resolvedFileName;
}

function isCustomResource(clazz: ClassDeclaration): boolean {
  return clazz.getBaseClass()?.getName() === "CustomResource";
}

function getConstructorParams(clazz: ClassDeclaration): ParameterDeclaration[] {
  const argTypes = clazz.getConstructors().flatMap((constructor) => {
    //return constructor.getParameter("args") ?? []
    return constructor.getParameters();
  });
  return [...new Set(argTypes)];
}

function isTaggable(param: ParameterDeclaration): boolean {
  const type = param.getType();
  const tagsProperty = type.getProperty("tags");
  const tagsType = tagsProperty?.getTypeAtLocation(param);
  return tagsType?.isAssignableTo(expectedTagsType) || false;
}

function hasTaggableArgs(clazz: ClassDeclaration): boolean {
  return getConstructorParams(clazz).some(isTaggable);
}

function getPulumiType(
  expression: ExpressionStatement,
): { resourceType: Type; typeString: string } | undefined {
  const binaryExpressions = expression.getChildrenOfKind(
    SyntaxKind.BinaryExpression,
  );
  for (let index = binaryExpressions.length - 1; index >= 0; index--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const binExp = binaryExpressions[index]!;
    const children = binExp.getChildren();
    // We should have 3 children such as:
    // ['Analyzer.__pulumiType', '=', "'aws:accessanalyzer/analyzer:Analyzer'"]
    if (children.length === 3) {
      const [propertyAccess, equals, typeLiteral] = children as [
        Node,
        Node,
        Node,
      ];
      if (
        propertyAccess.isKind(SyntaxKind.PropertyAccessExpression) &&
        equals.isKind(SyntaxKind.EqualsToken) &&
        typeLiteral.isKind(SyntaxKind.StringLiteral)
      ) {
        const identifiers = propertyAccess.getChildrenOfKind(
          SyntaxKind.Identifier,
        );
        if (identifiers.length === 2) {
          const [left, right] = identifiers as [Identifier, Identifier];
          if (right.getText() === "__pulumiType") {
            return {
              resourceType: left.getType(),
              typeString: typeLiteral.getText(),
            };
          }
        }
      }
    }
  }
  return;
}

function isTsClassDeclaration(
  declaration: ts.Declaration,
): declaration is ts.ClassDeclaration {
  return declaration.kind === SyntaxKind.ClassDeclaration;
}

function isTsSourceFile(node: ts.Node): node is ts.SourceFile {
  return node.kind === SyntaxKind.SourceFile;
}

function getClassDeclaration(type: Type) {
  return type.compilerType.symbol.declarations?.find(isTsClassDeclaration);
}

function removeExtension(fileName: string) {
  const parsed = path.parse(fileName);
  const name = parsed.name.replace(/\..*/, "");
  return path.join(parsed.dir, name);
}

function getClassDetails(type: Type) {
  const clazzDeclaration = getClassDeclaration(type);
  if (
    clazzDeclaration &&
    clazzDeclaration.name &&
    isTsSourceFile(clazzDeclaration.parent)
  ) {
    return {
      name: clazzDeclaration.name.text,
      fileName: removeExtension(clazzDeclaration.parent.fileName),
    };
  }
  return;
}

function isSameClass(tsClazz: Type, jsClazz: Type): boolean {
  const tsClazzDetails = getClassDetails(tsClazz);
  const jsClazzDetails = getClassDetails(jsClazz);
  return (
    (tsClazzDetails &&
      jsClazzDetails &&
      tsClazzDetails.name === jsClazzDetails.name &&
      tsClazzDetails?.fileName === jsClazzDetails?.fileName) ??
    false
  );
}

function getResourceTypes(
  sourceFile: SourceFile,
  resourceClazzes: ClassDeclaration[],
): string[] {
  // Unfortunately there is no public API to get this type, so we have to try and find it in the JavaScript source.
  // See https://github.com/pulumi/pulumi/issues/15890.
  const jsFilePath = sourceFile.getFilePath().replace(".d.ts", ".js");
  const jsFile = project.getSourceFileOrThrow(jsFilePath);
  const statements = jsFile.getStatements();
  const expressions = statements.flatMap((s) =>
    s.isKind(SyntaxKind.ExpressionStatement) ? [s] : [],
  );
  const pulumiTypes = expressions.flatMap(
    (expression) => getPulumiType(expression) ?? [],
  );
  const remainingClazzes = new Set(resourceClazzes);
  const resourceTypes = pulumiTypes.flatMap(({ resourceType, typeString }) => {
    for (const clazz of remainingClazzes) {
      const clazzType = clazz.getType();
      if (clazzType.isAny()) {
        throw `clazzType is any!`;
      }
      if (resourceType.isAny()) {
        throw `resourceType is any!`;
      }
      // The classes come from different files, and so we cannot use isAssignableTo as they are not seen as the same
      // types. We do a best effort to compare them.
      if (isSameClass(clazzType, resourceType)) {
        remainingClazzes.delete(clazz);
        return typeString;
      }
    }
    return [];
  });
  if (remainingClazzes.size > 0) {
    const names = [...remainingClazzes]
      .map((clazz) => clazz.getName())
      .join(", ");
    throw `Unable to find the type of the resources: ${names}`;
  }
  return resourceTypes;
}

function getTaggableResourceTypes(sourceFile: SourceFile): string[] {
  const customResources = sourceFile.getClasses().filter(isCustomResource);
  if (customResources.length === 0) return [];
  const taggableResources = customResources.filter(hasTaggableArgs);
  return getResourceTypes(sourceFile, taggableResources);
}

function findTaggableResources(): string[] {
  const modulePath = resolveModulePath("@pulumi/aws");
  project.addSourceFileAtPath(modulePath);
  project.resolveSourceFileDependencies();
  const sourceFiles = project.getSourceFiles();
  const glob = `${path.dirname(modulePath)}/**/*.js`;
  project.addSourceFilesAtPaths(glob);
  return sourceFiles.flatMap(getTaggableResourceTypes);
}

const sourceFile = project.createSourceFile(
  "src/taggable-types.ts",
  {
    statements: [
      "// Do not edit this manually.",
      "// Regenerate it by running: npm run generate",
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            kind: StructureKind.VariableDeclaration,
            name: "TAGGABLE_TYPES",
            type: "string[]",
            initializer: (writer) => {
              writer.writeLine("[");
              findTaggableResources().forEach((resource) =>
                writer.write(resource).write(",").newLine(),
              );
              writer.writeLine("]");
            },
          },
        ],
        isExported: true,
      },
    ],
  },
  {
    overwrite: true,
  },
);

sourceFile.saveSync();
