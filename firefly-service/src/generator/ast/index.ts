import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

import { NodeParam } from '../../types';

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
}
