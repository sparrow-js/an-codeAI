
import { Component, ReactNode } from 'react';
import { ComponentOutLineView } from './ComponentOutline';

export class OutLineView extends Component {
    render() {
        return (
          <>
            <div>
              label
            </div>
            <ComponentOutLineView />
          </>
        );
    }
}