import { Schema as ApplicationOptions } from "./schema";
import {
  SchematicsException,
  chain,
  Tree,
  SchematicContext,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  template,
  TemplateOptions,
  move,
  Rule,
  noop
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  stringUtils,
  getNpmScope,
  getPrefix,
  addRootDeps,
  getJsonFromFile,
  updatePackageScripts,
  addPostinstallers,
  formatFiles,
  updateNxProjects
} from "../utils";

export default function(options: ApplicationOptions) {
  if (!options.name) {
    throw new SchematicsException(
      `Missing name argument. Provide a name for your Nest app. Example: ng g app.nest sample`
    );
  }

  const appPath = `nest-${options.name}`;

  return chain([
    // create app files
    (tree: Tree, context: SchematicContext) =>
      addAppFiles(options, appPath)(tree, context),
    // add root package dependencies
    (tree: Tree) => addRootDeps(tree, { nest: true }),
    // add npm scripts
    (tree: Tree) => {
      const packageConfig = getJsonFromFile(tree, "package.json");
      const scripts = packageConfig.scripts || {};

      scripts[`serve.nest.${options.name}`] = `ts-node -P apps/nest-${
        options.name
      }/tsconfig.json apps/nest-${options.name}/src/main.ts`;
      scripts[`start.nest.${options.name}`] = `npm-run-all -p serve.nest.${
        options.name
      }`;

      return updatePackageScripts(tree, scripts);
    },
    // nx.json
    (tree: Tree) => {
      const projects = {};
      projects[`nest-${options.name}`] = {
        tags: []
      };
      return updateNxProjects(tree, projects);
    },
    addInstall,
    addPostinstallers(),
    options.skipFormat ? noop() : formatFiles(options)
  ]);
}

function addInstall(host: Tree, context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
  return host;
}

function addAppFiles(
  options: ApplicationOptions,
  appPath: string,
  sample: string = ""
): Rule {
  sample = "";
  return branchAndMerge(
    mergeWith(
      apply(url(`./_${sample}files`), [
        template(<TemplateOptions>{
          ...(options as any),
          utils: stringUtils,
          npmScope: getNpmScope(),
          prefix: getPrefix(),
          dot: "."
        }),
        move(`apps/${appPath}`)
      ])
    )
  );
}
