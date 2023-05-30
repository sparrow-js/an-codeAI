import { Injectable } from '@nestjs/common';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import FsHandler from '../generator/fshandler';
import { NodeParam } from '../types';
import Generator from '../generator/ast';
import * as prettier from 'prettier';

@Injectable()
export class EditService {
  testCode(): any {
    const code = `
<div>test</div>           
    `;
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
    const output = generate(
      ast,
      {
        /* options */
      },
      code,
    );
  }

  insertNode(nodeParam: NodeParam): any {
    const content = FsHandler.getInstance().parseFile(nodeParam.path);
    const code = Generator.getInstance().insertNode(content, nodeParam);
    const formatCode = prettier.format(code, { semi: true });
    FsHandler.getInstance().writeFile(nodeParam.path, formatCode);
    return {
      status: 1,
    };
  }

  moveNode(): any {
    console.log('moveNode');
  }

  deleteNode(): any {
    console.log('deleteNode');
  }

  replaceNode(): any {
    console.log('replaceNode');
  }
}
