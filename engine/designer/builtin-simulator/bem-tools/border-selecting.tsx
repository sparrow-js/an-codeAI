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
import { observer, computed, Tip, globalContext, makeObservable } from '../../../editor-core';
import { BuiltinSimulatorHost } from '../host';
import classNames from 'classnames';
import { OffsetObserver } from '../../designer';
import { Node } from '../../document';
import { getNearPath } from '../../../utils';
import { editDeleteNode } from '../../document/api';

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
            <SendBox observed={observed}/>
          </div>
        );
    }
}

@observer 
class SendBox extends Component<{ observed: OffsetObserver }> {
  get editor () {
    return globalContext.get('editor');
  }
  get sendMessage() {    
    return this.editor.get('designer').currentSelection.sendMessage
  };

  sendMessageChange = () => {
    const editor = globalContext.get('editor');
    const { observed: { node } } = this.props;
    const { instance } = node;
    // const path = getNearPath(instance);
    const { uid } = instance.dataset;
    // sendMessage
    editor.emit('editor.sendMessageChange', {
      uid, 
      message: this.sendMessage
    });
    if (this.editor.get('designer').currentSelection) {
      this.editor.get('designer').currentSelection.clear();
    }
  }

  render() {
    const { observed } = this.props;
    const { height, width } = observed.viewport;
    const BAR_HEIGHT = 110;
    const MARGIN = 1;
    const BORDER = 2;
    const SPACE_HEIGHT = BAR_HEIGHT + MARGIN + BORDER;
    const SPACE_MINIMUM_WIDTH = 400; // magic number，大致是 toolbar 的宽度
    let style: any;
    // 计算 toolbar 的上/下位置
    style = {
      bottom: -SPACE_HEIGHT,
      height: BAR_HEIGHT,
      width: SPACE_MINIMUM_WIDTH
    };
    // 计算 toolbar 的左/右位置
    if (SPACE_MINIMUM_WIDTH > observed.left + observed.width) {
      style.left = Math.max(-BORDER, observed.left - width - BORDER);
    } else {
      style.right = Math.max(-BORDER, observed.right - width - BORDER);
      style.justifyContent = 'flex-start';
    }

    return (
      <div className="lc-borders-actions" style={style}>
        <div
          className='bg-white lc-borders-send p-3 w-full shadow-lg rounded-lg max-w-sm mx-auto ring-1 ring-slate-900/10'
        >
          <textarea  
            value={this.sendMessage}
            onChange={(e) => {
              this.editor.get('designer').currentSelection.sendMessage = e.target.value;
              // e.target.value
                // this.setState({
                //   sendMessage: e.target.value
                // })
            }} 
            className="lc-borders-send-textarea text-xs w-full resize-none border-none outline-none" spellCheck="false" placeholder="Make the text larger or change the colors of this element." required></textarea>
          <div className='flex justify-end'>
            <button onClick={this.sendMessageChange} className="lc-borders-send-button">
              update
            </button>
          </div>
        </div>
      </div>
    )
  }
}

@observer
class Toolbar extends Component<{ observed: OffsetObserver }> {
  removeNode = async () => {
    const { observed: { node } } = this.props;
    const { instance } = node;
    const path = getNearPath(instance);
    const { uid } = instance.dataset;
    const res = await editDeleteNode({
      path,
      uid,
    });
    console.log('*', res);
  };

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
      <div className="lc-borders-actions" style={style}></div>
    )
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
            <BorderSelectingInstance key={observed.id} dragging={this.dragging} observed={observed} />
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