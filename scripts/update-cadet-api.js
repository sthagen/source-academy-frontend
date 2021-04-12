// This script generates a TypeScript file with the API endpoints of the cadet
// backend populated into methods in a class with accurate type declarations
// based on the `swagger.json` generated by the cadet backend.

const path = require("path");
const fs = require("fs");

const _ = require("lodash");
const { generateApi } = require("swagger-typescript-api");

const prettierConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../.prettierrc"), "utf-8"));

const inputFile = path.resolve(__dirname, "../src/commons/api/swagger.json");
const outputDir = path.resolve(__dirname, "../src/commons/api");
const outputFilename = "api.ts";

generateApi({
  input: inputFile,
  output: outputDir,
  name: outputFilename,
  prettier: Object.assign(prettierConfig, { parser: "typescript" }),

  httpClientType: "fetch",

  extractRequestParams: false,

  singleHttpClient: false,
  cleanOutput: false,
  enumNamesAsValues: false,

  // `phoenix_swagger` generates tags for each operation based on the controller
  // the operation is located in. By generating properties in the API based on the
  // first tag (corresponds to path), we can group operations based on the relevant
  // controller, eg. `api.assessments`, `api.incentives`, etc.
  moduleNameFirstTag: true,

  hooks: {
    onCreateComponent: (component) => {
      // `phoenix_swagger` only supports OpenAPI 2.0, which does not have the
      // `oneOf` keyword. To work around this, for types that are strings containing
      // `"_or_"`, we separate it to accept `oneOf` the following.
      // Eg. `"integer_or_string"` => `["integer", "string"]`
      if (_.has(component, "rawTypeData.properties")) {
        _.forEach(component.rawTypeData.properties, (property) => {
          if (/_or_/.test(property.type)) {
            property.type = property.type.split("_or_");
          }
        });
      }
    },
    onFormatRouteName: (_routeInfo, templateRouteName) => {
      // `phoenix_swagger` populates the `operationId`, which is used to form
      // the route name, as `"CadetWeb.AssessmentsController.show"`,
      // which is transformed to `"cadetWebAssessmentsControllerShow"`.
      // Since we're already segregating the API via tags,
      // transform the name to `"show"`, so we can call `api.assessments.show()`.
      return _.lowerFirst(templateRouteName.replace(/^.*?Controller/, ""));
    },
  }
})
  .then(({ files }) => {
    files.forEach(({ content, name }) => {
      fs.writeFile(path.join(outputDir, name), content, () => {});
    });
  })
  .catch(e => console.error(e));
