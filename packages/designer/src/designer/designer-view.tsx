import { Component } from 'react';
import classNames from 'classnames';
import { ProjectView } from '../project';

import { Designer, DesignerProps } from './designer';
import './designer.less';

export class DesignerView extends Component<DesignerProps & {
    designer?: Designer;
  }> {
    readonly designer: Designer;
    constructor(props: any) {
        super(props);
        const { designer, ...designerProps } = props;
        if (designer) {
          this.designer = designer;
          designer.setProps(designerProps);
        } else {
          this.designer = new Designer(designerProps);
        }
    }

    shouldComponentUpdate(nextProps: DesignerProps) {
        this.designer.setProps(nextProps);
        const { props } = this;
        if (
          nextProps.className !== props.className ||
          nextProps.style !== props.style ||
          nextProps.dragGhostComponent !== props.dragGhostComponent
        ) {
          return true;
        }
        return false;
    }

    componentDidMount() {
        const { onMount } = this.props;
        if (onMount) {
          onMount(this.designer);
        }
        // clipboard.injectCopyPaster(document);
        this.designer.postEvent('mount', this.designer);
    }

    UNSAFE_componentWillMount() {
        this.designer.purge();
    }

    render() {
        const { className, style, dragGhostComponent } = this.props;
        return (
          <div className={classNames('lc-designer', className)} style={style}>
            <ProjectView designer={this.designer} />
          </div>
        );
      }

}