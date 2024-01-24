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
import { GeneratedCodeConfig } from "../types";
import { get } from 'lodash';


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

function parseJsxExpression(node: any) {

    function walk(node: any) {
      if (node.kind === TS.SyntaxKind.JsxElement) {
      } else if (node.kind === TS.SyntaxKind.JsxSelfClosingElement) {
      } else if (node.kind === TS.SyntaxKind.JsxExpression) {
        const jsxNode = get(node, 'expression.arguments[0].body.expression');
        if (jsxNode && jsxNode.kind === TS.SyntaxKind.JsxElement) {
          jsxContainerList.push(jsxNode);
          parseJsxExpression(jsxNode);
        }
      } else {
        return null;
      }
  
      const { children } = node as any;
  
      if (children) {
        children.reduce((result:any, currNode: any) => {
          walk(currNode);
        }, []);
      }
  
    }
    walk(node)
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
    for (let i = 0; i < jsxContainerList.length; i++) {
      parseJsxExpression(jsxContainerList[i]);
    }
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
  

  function setJsxElementUid(nodeList: Node[], sourceFile: TS.SourceFile, anchorUid: string) {
    const cacheJsxList: any[] = [];
    const hasAnchorUid = !!anchorUid;
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
        if (hasAnchorUid) {
          if (anchorUid === uid && leaf['tagName']) {
            appendUidAttribute(uid, (node as any).openingElement.attributes);
          }
        } else {
          if (leaf['tagName']) {
            appendUidAttribute(uid, (node as any).openingElement.attributes);
          }
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
        if (hasAnchorUid) {
          if (anchorUid === uid && leaf['tagName']) {
            appendUidAttribute(uid, (node as any).attributes);
          }
        } else {
          if (leaf['tagName']) {
            appendUidAttribute(uid, (node as any).attributes);
          }
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

export default function setCodeUid (code: string, anchorUid: string = '', path: string = '/mock.tsx') {
    alreadyExistingUIDs.set(path, new Set());
    const sourceFile = TS.createSourceFile(path, code, TS.ScriptTarget.ESNext);
    const nodeObject = sourceFile.getChildren()[0];

    findJsxNode(nodeObject);
    const cacheJsx = setJsxElementUid(jsxContainerList,sourceFile, anchorUid);

    const printer = TS.createPrinter();
    const codeUid = printer.printNode(TS.EmitHint.Unspecified, sourceFile, sourceFile);
    return codeUid;
}

export function setHtmlCodeUid(generatedCodeConfig: GeneratedCodeConfig, code: string, anchorUid: string = '', path: string = '/mock.tsx') {
  if (!code) return code;
  if (generatedCodeConfig === GeneratedCodeConfig.HTML_TAILWIND) {
    var patternBody = /<body[^>]*>((.|[\n\r])*)<\/body>/im; //匹配header
    const headMatch = code.match(patternBody);
    if (headMatch) {
      const htmlCode = `
      function htmlRender () {
        return (
    ${headMatch[0].replaceAll(/<!--((.)*)-->/img, '').replaceAll('$', '')}; // todo: if string include $ out error.
        )
      }
      `;
      const codeJsx = setCodeUid(htmlCode, anchorUid, path);
      const body = codeJsx.match(patternBody);
      if (body) {
        return code.replace(patternBody,  body[0]);
      }
      return code
    } else {
      return code;
    }
  } else if (generatedCodeConfig === GeneratedCodeConfig.REACT_TAILWIND) {
    var patternScript = /<script type="text\/babel"[^>]*>((.|[\n\r])*)<\/script>/im; //匹配script
    const scriptMatch = code.match(patternScript);
    if (scriptMatch) {
      const codeJsx = setCodeUid(scriptMatch[1], anchorUid, path);
      if (codeJsx) {
        let codeScript = `
<script type="text/babel">
${codeJsx}
</script>
        `;
        // todo: 这里$100.00 匹配有问题，后面研究
        const temp = code.replace(patternScript, `
<script type="text/babel">
</script>
        `);
        return temp.replace(patternScript, codeScript);

      }
      return code;
    }
    return code;
  } else if (generatedCodeConfig === GeneratedCodeConfig.REACT_SHADCN_UI) {
    const codeJsx = setCodeUid(code, anchorUid, path);
    return codeJsx;
  }
  return code;
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

export function setUidAnchorPoint(uid: string, code: string, generatedCodeConfig: GeneratedCodeConfig) {
  const codeHtml = setHtmlCodeUid(generatedCodeConfig, code, uid);
  return codeHtml;
}


// function test () {
//   const codeHtml = `
//   <html>
//   <head>
//     <title>Hacker News Clone</title>
//     <script src="https://registry.npmmirror.com/react/18.2.0/files/umd/react.development.js"></script>
//     <script src="https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.development.js"></script>
//     <script src="https://registry.npmmirror.com/@babel/standalone/7.23.6/files/babel.js"></script>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
//     <style>
//       body {
//         font-family: 'Verdana', sans-serif;
//       }
//     </style>
//   </head>
//   <body class="bg-gray-200">
//     <div id="app"></div>

    

// <script type="text/babel">
// const newsItems = [
//     { id: 1, title: "Czech republic sets IPv4 end date", points: 95, author: "deadbunny", time: "1 hour ago", comments: 39, url: "konecipv4.cz" },
//     // ... Add all other news items here with the same structure
//     { id: 20, title: "Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data", points: 9, author: "liheyoung", time: "1 hour ago", comments: 0, url: "github.com/liheyoung" }
// ];
// function App() {
//     return (<div className="bg-white p-4">
//             <header className="flex justify-between items-center mb-4 bg-orange-400">
//               <h1 className="text-lg font-bold">Hacker News</h1>
//               <nav>
//                 <a href="#" className="text-red-600 hover:underline">new</a> |
//                 <a href="#" className="hover:underline">past</a> |
//                 <a href="#" className="hover:underline">comments</a> |
//                 <a href="#" className="hover:underline">ask</a> |
//                 <a href="#" className="hover:underline">show</a> |
//                 <a href="#" className="hover:underline">jobs</a> |
//                 <a href="#" className="hover:underline">submit</a>
//               </nav>
//               <a href="#" className="hover:underline">login</a>
//             </header>
//             <main>
//               <ul>
//                 {newsItems.map(item => (<li key={item.id} className="mb-2">
//                     <span className="text-orange-400 mr-2">{item.id}.</span>
//                     <a href={item.url} className="text-black hover:underline">{item.title}</a>
//                     <span className="text-gray-600 text-sm ml-2">({item.url})</span>
//                     <div className="text-gray-600 text-sm">
//                       {item.points} points by {item.author} {item.time} | <a href="#" className="hover:underline">hide</a> | {item.comments} comments
//                     </div>
//                   </li>))}
//               </ul>
//             </main>
//           </div>);
// }
// ReactDOM.render(<App />, document.getElementById("app"));

// </script>
        
        
//   </body>
// </html>
//   `;

  
//   const code = setHtmlCodeUid(GeneratedCodeConfig.REACT_TAILWIND, codeHtml, '');
//   console.log('*******', code);
// }

// test();