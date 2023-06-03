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
import { Node } from '../../document';

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
            <Toolbar observed={observed} />
          </div>
        );
    }
}

@observer
class Toolbar extends Component<{ observed: OffsetObserver }> {
  render() {
    const { observed } = this.props;
    const { height, width } = observed.viewport;
    const BAR_HEIGHT = 20;
    const MARGIN = 1;
    const BORDER = 2;
    const SPACE_HEIGHT = BAR_HEIGHT + MARGIN + BORDER;
    const SPACE_MINIMUM_WIDTH = 160; // magic number，大致是 toolbar 的宽度
    let style: any;
    // 计算 toolbar 的上/下位置
    if (observed.top > SPACE_HEIGHT) {
      style = {
        top: -SPACE_HEIGHT,
        height: BAR_HEIGHT,
      };
    } else if (observed.bottom + SPACE_HEIGHT < height) {
      style = {
        bottom: -SPACE_HEIGHT,
        height: BAR_HEIGHT,
      };
    } else {
      style = {
        height: BAR_HEIGHT,
        top: Math.max(MARGIN, MARGIN - observed.top),
      };
    }
    // 计算 toolbar 的左/右位置
    if (SPACE_MINIMUM_WIDTH > observed.left + observed.width) {
      style.left = Math.max(-BORDER, observed.left - width - BORDER);
    } else {
      style.right = Math.max(-BORDER, observed.right - width - BORDER);
      style.justifyContent = 'flex-start';
    }
    const { node } = observed;
    const actions: ReactNodeArray = [];
    // node.componentMeta.availableActions.forEach((action) => {
    //   const { important = true, condition, content, name } = action;
    //   if (node.isSlot() && (name === 'copy' || name === 'remove')) {
    //     // FIXME: need this?
    //     return;
    //   }
    //   if (important && (typeof condition === 'function' ? condition(node) !== false : condition !== false)) {
    //     actions.push(createAction(content, name, node));
    //   }
    // });
    return (
      <div className="lc-borders-actions" style={style}>
        <span>test</span>
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
      const { node } = this.props;
        const { designer } = this.host;
        const instance = this.instances && this.instances[0] || undefined;
        const observed = designer.createOffsetObserver({
            node,
            instance: node.instance,
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
  get host(): BuiltinSimulatorHost {
    return this.props.host;
  }

  get dragging(): boolean {
    return this.host.designer.dragon.dragging;
  }


  @computed get selecting() {
    const doc = this.host.currentDocument;
    if (!doc || doc.suspensed) {
      return null;
    }
    const { selection } = doc;
    return this.dragging ? selection.getTopNodes() : selection.getNodes();
  }

  render() {
    if (!this.selecting || this.selecting.length < 1) {
      return null;
    }
    const node = this.selecting[0];
      return (
        <Fragment>
          <BorderSelectingForNode key={'2'} host={this.props.host} node={node} />
        </Fragment>
      );
  }
}