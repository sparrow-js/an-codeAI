import TS, {
  JsxAttribute,
  Node,
  Block,
  JsxAttributes,
  Expression,
  NodeFactory,
  factory,
} from 'typescript';
import Hash from 'object-hash';
import { generateConsistentUID } from './uid-utils';
import { fixParseSuccessUIDs } from './uid-fix';
import { syncNodeIdMap } from './request';
import Store from './store';

const cacheTree = {};
let alreadyExistingUIDs: Set<string> = new Set();
// factory.createJsxAttribute
let jsxContainerMap = {};

function getJsx(functionNode: Node) {
  const jsxArr: any[] = [];
  // const node: Block = (functionNode as any).body;
  function findJsx(node: Node) {
    if (!node) return;
    if (node.kind === TS.SyntaxKind.Block) {
      const { statements } = node as Block;
      statements.forEach((stateNode) => {
        findJsx(stateNode);
      });
    } else if (
      node.kind === TS.SyntaxKind.ReturnStatement ||
      node.kind === TS.SyntaxKind.ParenthesizedExpression
    ) {
      const { expression } = node as any;
      if (expression) findJsx(expression);
    } else if (node.kind === TS.SyntaxKind.JsxElement) {
      jsxArr.push(node);
    }
  }
  findJsx(functionNode);
  return jsxArr;
}

function getAttributes(attributes: JsxAttribute, sourceFile: TS.SourceFile) {
  const props = [];
  const { properties } = attributes as any;
  if (properties) {
    properties.forEach((propertie) => {
      const propStr = propertie.getText(sourceFile);
      const propArr = propStr.split('=');
      props.push({
        key: propArr[0],
        value: {
          value: propArr[1],
        },
      });
    });
  }
  return props;
}

function appendUidAttribute(uid: string, attributes: JsxAttributes) {
  const { properties } = attributes as any;
  properties.push(TS.factory.createJsxAttribute(TS.factory.createIdentifier('data-uid'), TS.factory.createStringLiteral(uid)));
}

function appendAttribute(attributes: JsxAttributes, key: string, value: string) {
  const { properties } = attributes as any;

  properties.push(
    TS.factory.createJsxAttribute(
      TS.factory.createIdentifier(key), TS.factory.createStringLiteral(value),
      ),
    );
}


function parseJSXElementName(node: Node, sourceFile: TS.SourceFile) {
  return (node as any).tagName.getText(sourceFile);
}

function setJsxElementUid(nodeList: Node[], sourceFile: TS.SourceFile) {
  const cacheJsxList = [];
  function walk(node: Node) {
    const leaf = {};
    if (node.kind === TS.SyntaxKind.JsxElement) {
      const props = getAttributes((node as any).openingElement.attributes, sourceFile);
      const hash = Hash({
        fileName: sourceFile.fileName,
        name: parseJSXElementName((node as any).openingElement, sourceFile),
        props,
      });

      const uid = generateConsistentUID(hash, alreadyExistingUIDs);
      leaf['uid'] = uid;
      leaf['tagName'] = (node as any).openingElement.tagName.getText(sourceFile);
      leaf['linkAttributes'] = (node as any).openingElement.attributes;
      leaf['linkNode'] = node;
      alreadyExistingUIDs.add(uid);
      appendUidAttribute(uid, (node as any).openingElement.attributes);
    } else if (node.kind === TS.SyntaxKind.JsxSelfClosingElement) {
      const props = getAttributes((node as any).attributes, sourceFile);
      const hash = Hash({
        fileName: sourceFile.fileName,
        name: parseJSXElementName(node, sourceFile),
        props,
      });

      const uid = generateConsistentUID(hash, alreadyExistingUIDs);
      leaf['uid'] = uid;
      leaf['tagName'] = (node as any).tagName.getText(sourceFile);
      leaf['linkAttributes'] = (node as any).attributes;
      leaf['linkNode'] = node;
      alreadyExistingUIDs.add(uid);
      appendUidAttribute(uid, (node as any).attributes);
    } else {
      return null;
    }

    const { children } = node as any;

    if (children) {
      leaf['children'] = children.reduce((result, currNode) => {
        const leaf = walk(currNode);
        if (leaf) {
          result.push(leaf);
        }
        return result;
      }, []);
    }

    return leaf;
  }
  nodeList.forEach((node) => {
    cacheJsxList.push(walk(node));
  });
  return cacheJsxList;
}

function setRootNodePath(path: string, nodeList: any[]) {
  nodeList.forEach((node) => {
    appendAttribute((node as any).openingElement.attributes, 'data-path', path);
  });
}

function parseArrowFunction(initializer, escapedText) {
  const { body: { statements } } = initializer;
  Array.isArray(statements) && statements.forEach((node) => {
    if (node.kind === TS.SyntaxKind.ReturnStatement) {
      const jsx = getJsx(node);
      jsxContainerMap[escapedText] = jsx;
    }
  });
}

function parseVariableDeclarationList(declarations) {
  for (let i = 0; i < declarations.length; i++) {
    const { initializer, name } = declarations[i];
    if (initializer.kind === TS.SyntaxKind.ArrowFunction) {
      parseArrowFunction(initializer, name.escapedText);
    }
  }
}

function findJsxNode(node: Node) {
  jsxContainerMap = {};
  const dfs = function (node: Node) {
    if (!node) return;
    if (node.kind === TS.SyntaxKind.JsxElement) {
      // jsxContainerMap[] = node;
      return;
    }
    if (node.kind === TS.SyntaxKind.VariableStatement) {
      if (node.declarationList && node.declarationList.declarations) {
        parseVariableDeclarationList(node.declarationList.declarations);
      }
    }
    const { children } = node as any;
    children && children.forEach((cur) => {
      dfs(cur);
    });
  };
  const child = node.getChildren();
  child.forEach(item => {
    dfs(item);
  });
  return jsxContainerMap;
}

export default function markjsx() {
    return {
      name: 'transform-file',
      transform(code: string, id: string) {
        const root = {};
        alreadyExistingUIDs = new Set();
        if (id.includes('/src/pages') && id.includes('tsx')) {
          const sourceFile = TS.createSourceFile(id, code, TS.ScriptTarget.ESNext);
          const nodeObject = sourceFile.getChildren()[0];
          findJsxNode(nodeObject);
          Object.keys(jsxContainerMap).forEach((key) => {
              const jsxNodeList: Node = jsxContainerMap[key];
              const cacheJsx = setJsxElementUid(jsxNodeList, sourceFile);
              if (!cacheTree[id]) {
                cacheTree[id] = {};
              }
              const oldParse = cacheTree[id][key] || null;
              fixParseSuccessUIDs(oldParse, cacheJsx);
              cacheTree[id][key] = cacheJsx;
              setRootNodePath(id, jsxNodeList);
          });
          const uidMap = Store.getInstance().getOldUidToOriginUid();
          // syncNodeIdMap({
          //   uidMap,
          // });
          const printer = TS.createPrinter();
          code = printer.printNode(TS.EmitHint.Unspecified, sourceFile, sourceFile);
          if (id.includes('/dashboard/index')) {
            console.log(code);
          }
        }
        return {
          code,
          map: null,
        };
      },
    };
}