import template from "babel-template";
import _getOpts from "./_getOpts";

const pathExpression = path => {
  return path.isJSXExpressionContainer() ? path.node.expression : path.node;
};

const buildEventCallback = template("(function(event, domID, originalEvent) { BODY; }).bind(this)");
const buildSpShow = template("(CONDITION ? EXPRESSION : void 0)");
const buildSpShowNoVoid = template("(CONDITION ? EXPRESSION : undefined)");

const buildForEachRepeat = repeat => {
  return template(`${ repeat }(COLLECTION, function(PARAMS) { return BODY; }.bind(this))`);
};

const buildSequenceRepeat = template(`(function(cb) {
  var res = new Array(LENGTH);
  for (var i = 0; i < LENGTH; i++) {
    res[i] = cb(i);
  }
  return res;
})(function(index) {
  return BODY;
}.bind(this))`.replace(/\n[^\S\n]+/mg, ""));

const buildDefaultRepeat = buildForEachRepeat(_getOpts(null, {
  file: {
    ast: {
      comments: []
    }
  }
}).repeat);

const buildArrayRepeat = (node, path) => {
  const {value} = node.value.expression;

  if (!/^\d+$/.test(value)) {
    throw path.buildCodeFrameError(`spRepeat expected value to be positive integer but instead got "${ value }"`);
  }

  return buildSequenceRepeat({
    LENGTH: node.value.expression,
    BODY: pathExpression(path)
  });
};

const buildObjectRepeat = (file, path, node, opts) => {
  const ast = file.parse(node.value.value);

  if (ast.program.body.length !== 1) {
    throw path.buildCodeFrameError("spRepeat expected value to have one statement");
  }

  const body = ast.program.body[0];

  if ("ExpressionStatement" !== body.type) {
    throw path.buildCodeFrameError(`spRepeat expected value to be of a type ["ExpressionStatement"] but instead got "${ body.type }"`);
  }

  if ("BinaryExpression" !== body.expression.type || "in" !== body.expression.operator) {
    throw path.buildCodeFrameError("spRepeat expected value to be '(value, key) in obj' or 'element in elements'");
  }

  const {left, right} = body.expression;
  let params = left;

  if (left.type !== "Identifier") {
    if (left.type !== "SequenceExpression") {
      throw path.buildCodeFrameError(`spRepeat expected left operand to be of a type ["Identifier",  "SequenceExpression"] but instead got "${ left.type }"`);
    }

    params = left.expressions;

    params.forEach(param => {
      if (param.type !== "Identifier") {
        throw path.buildCodeFrameError("spRepeat expected left operand to only contain identifiers");
      }
    });
  }

  return (opts.repeat ? buildForEachRepeat(opts.repeat) : buildDefaultRepeat)({
    COLLECTION: right,
    PARAMS: params,
    BODY: pathExpression(path)
  });
};

export default function({types: t}) {
  return {
    visitor: {
      JSXElement: {
        enter(path, state) {
          let spRepeat = false;
          let spShow = false;
          const exprTransforms = [];

          const opts = _getOpts(path, state);

          const openingElement = path.get("openingElement");
          const attributes = openingElement.get("attributes");

          if (attributes) {
            attributes.forEach(attr => {
              if (!attr.isJSXAttribute()) {
                return;
              }

              const {name} = attr.node.name;
              if (opts.events.indexOf(name) !== -1) {
                const statement = buildEventCallback({
                  BODY: attr.node.value.expression
                });

                const expression = t.JSXExpressionContainer(statement.expression);
                attr.replaceWith(t.JSXAttribute(t.JSXIdentifier(`on${ name.slice(2) }`), expression));
              } else if (name === "spModel") {
                const expression = attr.get("value").get("expression");
                if (expression.isMemberExpression()) {
                  const {object, property} = expression.node;
                  expression.replaceWith(t.arrayExpression([object, property.type === "Identifier" ? t.stringLiteral(property.name) : property]));
                }
              } else if (name === "spRepeat") {
                if (!spRepeat) {
                  exprTransforms.push(attr.node);
                  spRepeat = true;
                }
                attr.remove();
              } else if (name === "spShow") {
                if (!spShow) {
                  exprTransforms.push(attr.node);
                  spShow = true;
                }
                attr.remove();
              }
            });
          }

          exprTransforms.reverse().forEach(node => {
            const {name} = node.name;

            let newPath = path;

            if (name === "spShow") {
              newPath = (opts.noVoid ? buildSpShowNoVoid : buildSpShow)({
                CONDITION: node.value.expression,
                EXPRESSION: pathExpression(path)
              });
            } else if (name === "spRepeat") {
              if (node.value.type === "StringLiteral") {
                newPath = buildObjectRepeat(this.file, path, node, opts);
              } else if (node.value.type === "JSXExpressionContainer" && node.value.expression.type === "NumericLiteral") {
                newPath = buildArrayRepeat(node, path);
              } else {
                throw path.buildCodeFrameError(`spRepeat expected value to be of a type ["StringLiteral",  "NumericLiteral"] but instead got "${ node.value.type }"`);
              }
            }

            if (path !== newPath) {
              if (path.parent.type === "JSXElement") {
                path.replaceWith(t.JSXExpressionContainer(newPath.expression));
              } else {
                path.replaceWith(newPath);
              }
            }
          });
        }
      }
    }
  };
}
