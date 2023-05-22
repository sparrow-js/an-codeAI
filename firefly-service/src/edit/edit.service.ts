import { Injectable } from '@nestjs/common';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

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
    console.log('***********1', JSON.stringify(ast, null, 2));
    const output = generate(
      ast,
      {
        /* options */
      },
      code,
    );
    console.log('***********1', output);
  }
}
