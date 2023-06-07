import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

import { NodeParam } from '../../types';
import * as _ from 'lodash';

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

    traverse(ast, {
      enter: ({ node }) => {
        if (node.start == start && node.end == end) {
          (node as any).children.splice(
            nodeParam.position,
            0,
            parser.parse(nodeParam.content || '<h1>辅助前端开发</h1>', {
              sourceType: 'module',
              plugins: ['jsx'],
            }),
          );
        }
      },
    });
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
