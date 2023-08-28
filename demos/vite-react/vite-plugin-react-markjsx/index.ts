import TS, {
  JsxAttribute,
  Node,
  Block,
  JsxAttributes,
  Expression,
  NodeFactory,
  factory
} from 'typescript';
import Hash from 'object-hash';
import {generateConsistentUID} from './uid-utils'
import { fixParseSuccessUIDs } from './uid-fix';
const cacheTree = {};
const alreadyExistingUIDs: Set<string> = new Set();
// factory.createJsxAttribute

function getFunctionJsx(functionNode: Node) {
  const jsxArr = [];
  const node: Block = (functionNode as any).body;
  function findJsx (node: Node) {
    if (!node) return;
    if (node.kind === TS.SyntaxKind.Block) {
      const statements = (node as Block).statements;
      statements.forEach(stateNode => {
        findJsx(stateNode);
      });
    } else if (
      node.kind === TS.SyntaxKind.ReturnStatement || 
      node.kind === TS.SyntaxKind.ParenthesizedExpression
    ){
      const expression = (node as any).expression;
      if (expression) findJsx(expression);
    } else if (node.kind === TS.SyntaxKind.JsxElement){
      jsxArr.push(node);
    }
  }
  findJsx(node);
  return jsxArr;
}

function getAttributes(attributes: JsxAttribute, sourceFile: TS.SourceFile) {
  const props = [];
  const properties: Array<JsxAttribute> = (attributes as any).properties;
  if (properties) {
    properties.forEach(propertie => {
      const propStr = propertie.getText(sourceFile);
      const propArr = propStr.split('=');
      props.push({
        key: propArr[0],
        value: {
          value: propArr[1]
        }
      })
    })
  }
  return props;
}

function appendUidAttribute(uid: string, attributes: JsxAttributes) {
  const properties: Array<JsxAttribute> = (attributes as any).properties;
  properties.push(TS.factory.createJsxAttribute(TS.factory.createIdentifier('data-uid'), TS.factory.createStringLiteral(uid)))
}

function parseJSXElementName(node: Node, sourceFile: TS.SourceFile) {
  return (node as any).tagName.getText(sourceFile);
}

function setJsxElementUid(nodeList: Array<Node>, sourceFile: TS.SourceFile) {
  const cacheJsxList = [];
  function walk(node: Node) {
    const leaf = {};
    if(node.kind === TS.SyntaxKind.JsxElement) {
      const props = getAttributes((node as any).openingElement.attributes, sourceFile)
      const hash = Hash({
        fileName: sourceFile.fileName,
        name:  parseJSXElementName((node as any).openingElement, sourceFile),
        props,
      });

      const uid = generateConsistentUID(hash, alreadyExistingUIDs);
      leaf['uid'] = uid;
      leaf['tagName'] = (node as any).openingElement.tagName.getText(sourceFile);
      leaf['linkAttributes'] = (node as any).openingElement.attributes;
      leaf['linkNode'] = node;
      alreadyExistingUIDs.add(uid);
      appendUidAttribute(uid, (node as any).openingElement.attributes)
    } else {
      return null;
    }

    const children: Array<Node> = (node as any).children;

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
  nodeList.forEach((node)=> {
    cacheJsxList.push(walk(node));
  })
  return cacheJsxList;
}

export default function markjsx() {
    return {
      name: 'transform-file',
      transform(code: string, id: string) {
        const root = {};
        if (id.includes('/src/') && id.includes('.ts')) {
          console.log('file path', id);
          const sourceFile = TS.createSourceFile(id, code, TS.ScriptTarget.ESNext);
          const nodeObject = sourceFile.getChildren()[0];
          if (nodeObject) {
            const nodeList = nodeObject.getChildren();
            nodeList.forEach((node: Node) => {
              if (node.kind === TS.SyntaxKind.FunctionDeclaration) {
                const jsxNodeList = getFunctionJsx(node);
                const cacheJsx = setJsxElementUid(jsxNodeList, sourceFile);
                const oldParse = cacheTree[id] || null;
                fixParseSuccessUIDs(oldParse, cacheJsx);
                cacheTree[id] = cacheJsx;
              }
            })
          }
          const printer = TS.createPrinter()
          code = printer.printNode(TS.EmitHint.Unspecified, sourceFile, sourceFile);
        }
        return {
          code,
          map: null,
        };
      },
    };
}