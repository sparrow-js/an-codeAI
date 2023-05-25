import { Injectable } from '@nestjs/common';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import FsHandler from '../generator/fshandler';
import { NodeParam } from '../types';
import Generator from '../generator/ast';

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
    Generator.getInstance().insertNode(content, nodeParam);
    console.log('insertNode', content);
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
