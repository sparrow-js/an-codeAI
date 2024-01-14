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
    ${headMatch[0].replaceAll(/<!--((.)*)-->/img, '')}
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
//     <title>E-commerce Dashboard</title>
//     <script src="https://registry.npmmirror.com/react/18.2.0/files/umd/react.development.js"></script>
//     <script src="https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.development.js"></script>
//     <script src="https://registry.npmmirror.com/@babel/standalone/7.23.6/files/babel.js"></script>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
//   </head>
//   <body>
//     <div id="app"></div>

//     <script type="text/babel">
//       const Dashboard = () => {
//         return (
//           <div className="flex h-screen bg-gray-100">
//             <div className="flex flex-col w-64 bg-white shadow-lg">
//               <div className="flex items-center justify-center h-20 shadow-md">
//                 <h1 className="text-3xl uppercase text-indigo-500">Logo</h1>
//               </div>
//               <ul className="flex flex-col py-4">
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-tachometer-alt pr-2"></i>
//                     Dashboard
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-box pr-2"></i>
//                     Products
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-users pr-2"></i>
//                     Customers
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-file-invoice-dollar pr-2"></i>
//                     Orders
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-chart-line pr-2"></i>
//                     Reports
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center pl-6 p-2 text-gray-600 hover:bg-indigo-500 hover:text-white">
//                     <i className="fas fa-cog pr-2"></i>
//                     Settings
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div className="flex-1 flex flex-col overflow-hidden">
//               <header className="flex justify-between items-center p-6 bg-white border-b-2 border-gray-200">
//                 <div className="flex items-center space-x-4">
//                   <i className="fas fa-bars text-gray-600 text-2xl"></i>
//                   <h1 className="text-2xl text-gray-700 font-semibold">Dashboard</h1>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <i className="fas fa-bell text-gray-600 text-2xl"></i>
//                   <i className="fas fa-user-circle text-gray-600 text-2xl"></i>
//                 </div>
//               </header>
//               <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
//                 <div className="container mx-auto px-6 py-8">
//                   <h3 className="text-gray-700 text-3xl font-medium">Recent Orders</h3>
//                   <div className="mt-8">
//                     <div className="flex flex-col">
//                       <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
//                         <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
//                           <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
//                             <table className="min-w-full divide-y divide-gray-200">
//                               <thead className="bg-gray-50">
//                                 <tr>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Order ID
//                                   </th>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Product
//                                   </th>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Customer
//                                   </th>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Status
//                                   </th>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Total
//                                   </th>
//                                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Date
//                                   </th>
//                                   <th scope="col" className="relative px-6 py-3">
//                                     <span className="sr-only">Edit</span>
//                                   </th>
//                                 </tr>
//                               </thead>
//                               <tbody className="bg-white divide-y divide-gray-200">
//                                 <tr>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                                     #001
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                     Product Name 1
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                     Customer Name 1
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
//                                     Completed
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                     $100.00
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                     01/01/2021
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                     <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
//                                   </td>
//                                 </tr>
//                                 {/* Repeat for each order */}
//                                 {/* ... other orders ... */}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </main>
//             </div>
//           </div>
//         );
//       };

//       ReactDOM.render(<Dashboard />, document.getElementById('app'));
//     </script>
//   </body>
// </html>

//   `;

  
//   const code = setHtmlCodeUid(GeneratedCodeConfig.REACT_TAILWIND, codeHtml, '');
//   console.log('*******', code);
// }

// test();