import {
    Component,
    Fragment,
    ReactNodeArray,
    isValidElement,
    cloneElement,
    createElement,
    ReactNode,
    ComponentType,
  } from 'react';
import { observer, computed, Tip, globalContext, makeObservable } from '@firefly/auto-editor-core';
import { BuiltinSimulatorHost } from '../host';
import classNames from 'classnames';
import { OffsetObserver } from '../../designer';

@observer
export class BorderSelectingInstance extends Component<{
  observed: OffsetObserver;
  highlight?: boolean;
  dragging?: boolean;
}> {
    render() {
        const { observed, highlight, dragging } = this.props;
        if (!observed.hasOffset) {
          return null;
        }

        const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = observed;

        const style = {
            width: offsetWidth,
            height: offsetHeight,
            transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`,
        };

        const className = classNames('lc-borders lc-borders-selecting', {
            highlight,
            dragging,
        });

        return (
          <div className={className} style={style}>
            test
          </div>
        );
    }
}

@observer
export class BorderSelectingForNode extends Component<{ host: BuiltinSimulatorHost; node: Node }> {
    get host(): BuiltinSimulatorHost {
        return this.props.host;
    }

    get dragging(): boolean {
        return this.host.designer.dragon.dragging;
    }
    @computed get instances() {
        return this.host.getComponentInstances(this.props.node);
    }

    render() {

        const { designer } = this.host;
        const instance = this.instances && this.instances[0];
        const observed = designer.createOffsetObserver({
            instance,
        });
          if (!observed) {
            return null;
        }

        return (
          <Fragment>
            <BorderSelectingInstance key={observed.id} dragging={this.dragging} observed={observed} />;
          </Fragment>
        );
    }
}

@observer
export class BorderSelecting extends Component<{ host: BuiltinSimulatorHost }> {
    render() {
        return (
          <Fragment>
            <BorderSelectingForNode key={'2'} host={this.props.host} node={node} />
          </Fragment>
        );
    }
}