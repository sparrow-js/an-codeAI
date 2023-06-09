import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

import { NodeParam } from '../../types';
import * as _ from 'lodash';
import materials from 'src/materials';

export default class Generator {
  static _instance: Generator;

  static getInstance() {
    if (!this._instance) {
      this._instance = new Generator();
    }
    return this._instance;
  }

  insertNode(content: string, nodeParam: NodeParam): string {
    const { start, end } = nodeParam;
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
    const componentContent = materials[nodeParam.componentId].content;
    const m = parser.parse(componentContent, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
    console.log(
      '********123',
      JSON.stringify(_.get(m, 'program.body'), null, 2),
    );

    traverse(ast, {
      enter: ({ node }) => {
        if (node.start == start && node.end == end) {
          let effective = -1;
          let position = nodeParam.position;
          const children = (node as any).children;
          for (let i = 0; i < children.length; i++) {
            // console.log(
            //   '********5',
            //   position,
            //   children[i],
            //   children[i].value,
            //   (children[i].value || '').includes('\n'),
            //   i,
            //   effective,
            // );
            if (children[i].type === 'JSXElement') {
              ++effective;
            }
            if (effective === +nodeParam.position) {
              position = i;
              break;
            }
          }
          const componentParse = parser.parse(componentContent, {
            sourceType: 'module',
            plugins: ['jsx'],
          });

          children.splice(
            position,
            0,
            _.get(componentParse, 'program.body[0].expression'),
          );
        }
      },
    });
    console.log('******90', generate(ast).code);
    return generate(ast).code;
  }

  appendImport(importStr: string, content: string) {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    const astImport = parser.parse(importStr, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    const body = _.get(ast, 'program.body') || [];
    const bodyImport = _.get(astImport, 'program.body') || [];
    if (bodyImport.length) {
      body.unshift(bodyImport[0]);
    }
    return generate(ast).code;
  }

  appendRouter(content: string, router: string, importStr: string) {
    const code = this.appendImport(importStr, content);
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    const routerAst = parser.parse(router, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let routerNode = null;
    traverse(routerAst, {
      ObjectExpression: (path) => {
        if (path.parent.type === 'VariableDeclarator') {
          routerNode = path.node;
        }
      },
    });

    traverse(ast, {
      ArrayExpression: (path) => {
        if (path.parent.type === 'VariableDeclarator') {
          if (routerNode) path.node.elements.push(routerNode);
        }
      },
    });
    return generate(ast).code;
  }
}
