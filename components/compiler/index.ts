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

let jsxContainerList: any[] = [];
let alreadyExistingUIDs: Map<string, any> = new Map();
let cacheJsxMap: Map<string, any> = new Map();

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

function parseArrowFunction(initializer: any, escapedText: string) {
    const { body: { statements } } = initializer;
    Array.isArray(statements) && statements.forEach((node) => {
        if (node.kind === TS.SyntaxKind.ReturnStatement) {
            const jsx = getJsx(node);
            jsxContainerList.push(...jsx);
        }
    });
}

function parseFunction(initializer: any) {
    const { body: { statements } } = initializer;
    Array.isArray(statements) && statements.forEach((node) => {
        if (node.kind === TS.SyntaxKind.ReturnStatement) {
            const jsx = getJsx(node);
            jsxContainerList.push(...jsx);
        }
    });
}

function parseVariableDeclarationList(declarations: any[]) {
for (let i = 0; i < declarations.length; i++) {
        const { initializer, name } = declarations[i];
        if (initializer.kind === TS.SyntaxKind.ArrowFunction) {
            parseArrowFunction(initializer, name.escapedText);
        }
    }
}

function findJsxNode(node: Node) {
    jsxContainerList = [];
    const dfs = function (node: any) {
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

      if (node.kind === TS.SyntaxKind.FunctionDeclaration) {
        parseFunction(node)
      }


      const { children } = node as any;
      children && children.forEach((cur: any) => {
        dfs(cur);
      });
    };
    const child = node.getChildren();
    child.forEach(item => {
      dfs(item);
    });
    return jsxContainerList;
  }

  function getAttributes(attributes: JsxAttribute, sourceFile: TS.SourceFile) {
    const props: any[] = [];
    const { properties } = attributes as any;
    if (properties) {
      properties.forEach((propertie: any) => {
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

  function parseJSXElementName(node: Node, sourceFile: TS.SourceFile) {
    return (node as any).tagName.getText(sourceFile);
  }

  function appendUidAttribute(uid: string, attributes: JsxAttributes) {
    const { properties } = attributes as any;
    properties.push(TS.factory.createJsxAttribute(TS.factory.createIdentifier('data-uid'), TS.factory.createStringLiteral(uid)));
  }  
  

  function setJsxElementUid(nodeList: Node[], sourceFile: TS.SourceFile) {
    const cacheJsxList: any[] = [];
    if (cacheJsxMap.has(sourceFile.fileName)) {
      cacheJsxMap.delete(sourceFile.fileName);
    }
    const cacheJsx: any =  {};
    cacheJsxMap.set(sourceFile.fileName, cacheJsx)

    function walk(node: Node) {
      const leaf: any = {};
      const alreadyExistingUIDsFile = alreadyExistingUIDs.get(sourceFile.fileName);
      if (node.kind === TS.SyntaxKind.JsxElement) {
        const props = getAttributes((node as any).openingElement.attributes, sourceFile);
        const hash = Hash({
          fileName: sourceFile.fileName,
          name: parseJSXElementName((node as any).openingElement, sourceFile),
          props,
        });
        const uid = generateConsistentUID(hash, alreadyExistingUIDsFile);
        leaf['uid'] = uid;
        leaf['tagName'] = (node as any).openingElement.tagName.getText(sourceFile);
        leaf['linkAttributes'] = (node as any).openingElement.attributes;
        leaf['linkNode'] = node;
        alreadyExistingUIDsFile.add(uid);
        cacheJsx[uid] = leaf;
        if (leaf['tagName']) {
          appendUidAttribute(uid, (node as any).openingElement.attributes);
        }
      } else if (node.kind === TS.SyntaxKind.JsxSelfClosingElement) {
        const props = getAttributes((node as any).attributes, sourceFile);
        const hash = Hash({
          fileName: sourceFile.fileName,
          name: parseJSXElementName(node, sourceFile),
          props,
        });
  
        const uid = generateConsistentUID(hash, alreadyExistingUIDsFile);
        leaf['uid'] = uid;
        leaf['tagName'] = (node as any).tagName.getText(sourceFile);
        leaf['linkAttributes'] = (node as any).attributes;
        leaf['linkNode'] = node;
        alreadyExistingUIDsFile.add(uid);
        cacheJsx[uid] = leaf;
        if (leaf['tagName']) {
          appendUidAttribute(uid, (node as any).attributes);
        }
      } else {
        return null;
      }
  
      const { children } = node as any;
  
      if (children) {
        leaf['children'] = children.reduce((result:any, currNode: any) => {
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

export default function setCodeUid (code: string, path: string = '/mock.tsx') {
    alreadyExistingUIDs.set(path, new Set());
    const sourceFile = TS.createSourceFile(path, code, TS.ScriptTarget.ESNext);
    const nodeObject = sourceFile.getChildren()[0];
    findJsxNode(nodeObject);
    const cacheJsx = setJsxElementUid(jsxContainerList, sourceFile);

    const printer = TS.createPrinter();
    const codeUid = printer.printNode(TS.EmitHint.Unspecified, sourceFile, sourceFile);
    return codeUid;
}

export function setHtmlCodeUid(code: string, path: string = '/mock.tsx') {
  var patternBody = /<body[^>]*>((.|[\n\r])*)<\/body>/im; //匹配header
  const headMatch = code.match(patternBody);
  if (headMatch) {
    const htmlCode = `
    function htmlRender () {
      return (
  ${headMatch[0].replaceAll(/<!--((.)*)-->/img, '')}
      )
    }
    `;
    const codeJsx = setCodeUid(htmlCode, path);
    const body = codeJsx.match(patternBody);
    if (body) {
      return code.replace(patternBody,  body[0]);
    }
    return code
  } else {
    return code;
  }
}

export function getPartCodeUid(uid: string, path: string = '/mock.tsx') {
  if (cacheJsxMap.has(path)) {
    const htmlCode = `
function htmlRender () {
  return (<codebox></codebox>)
}
    `;
    const sourceFile = TS.createSourceFile('/part.tsx', htmlCode, TS.ScriptTarget.ESNext);
    const nodeObject = sourceFile.getChildren()[0];
    const jsxContainerList =findJsxNode(nodeObject);

    const cacheJsx = cacheJsxMap.get(path);
    const node = cacheJsx[uid];
    if (jsxContainerList.length && node) {
      const jsxContainer = jsxContainerList[0];
      jsxContainer.children.push(node.linkNode);
    }
    const printer = TS.createPrinter();
    const codeUid = printer.printNode(TS.EmitHint.Unspecified, sourceFile, sourceFile);
    var patternCodebox = /<codebox[^>]*>((.|[\n\r])*)<\/codebox>/im; //匹配header
    const codeBoxMatch = codeUid.match(patternCodebox);
    if (codeBoxMatch) {
      return codeBoxMatch[1];
    }
    return null;
  }
  return null;
}

// function test () {
//   const codeHtml = `

// <body class="bg-white text-gray-900">
//     <div class="container mx-auto px-4 py-12">
//         <h1 class="text-5xl font-bold mb-4">Things I've made trying to put my dent in the universe.</h1>
//         <p class="text-lg mb-12">I've worked on tons of little projects over the years but these are the ones that I'm most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.</p>
//         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div class="flex flex-col items-center">
//                 <img src="https://placehold.co/96x96" alt="Placeholder image for Planetaria project logo" class="mb-4">
//                 <h2 class="text-xl font-semibold mb-2">Planetaria</h2>
//                 <p class="text-center mb-4">Creating technology to empower civilians to explore space on their own terms.</p>
//                 <a href="#" class="text-indigo-600 hover:text-indigo-800 transition-colors">planetaria.tech</a>
//             </div>
//         </div>
//     </div>
// </body>
//   `;

  
//   const code = setHtmlCodeUid(codeHtml.replaceAll(/<!--((.)*)-->/img, ''));
//   console.log('*******', code);
// }

// test();