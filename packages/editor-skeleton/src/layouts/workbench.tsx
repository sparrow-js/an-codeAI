import { Component } from 'react';
import { Skeleton } from '../skeleton';
import { observer } from 'mobx-react';

@observer
export class Workbench extends Component<{ skeleton: Skeleton}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
          <div>Workbench</div>
        );
    }
}
