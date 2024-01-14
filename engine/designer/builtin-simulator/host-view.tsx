import React, { Component } from 'react';
import { observer, globalContext } from '../../editor-core';
import { BuiltinSimulatorHost, BuiltinSimulatorProps } from './host';
import { BemTools } from './bem-tools';
import { StatusBar } from './tools/status-bar';
import { Project } from '../project';
import './host.scss';
import {   
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview, 
  SandpackCodeEditor,
  Sandpack,
  SandpackPreviewRef
} from "@codesandbox/sandpack-react";
// import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";


type SimulatorHostProps = BuiltinSimulatorProps & {
    project: Project;
    onMount?: (host: BuiltinSimulatorHost) => void;
};

export class BuiltinSimulatorHostView extends Component<SimulatorHostProps> {
    readonly host: BuiltinSimulatorHost;

    constructor(props: any) {
        super(props);
        const { project, onMount } = this.props;
        this.host = (project.simulator as BuiltinSimulatorHost) || new BuiltinSimulatorHost(project);
        this.host.setProps(this.props);
        onMount?.(this.host);

      }

      shouldComponentUpdate(nextProps: BuiltinSimulatorProps) {
        this.host.setProps(nextProps);
        return false;
      }

      render() {
        return (
          <div className="lc-simulator">
            <Canvas host={this.host} />
          </div>
        );
      }
}

@observer
class Canvas extends Component<{ host: BuiltinSimulatorHost }> {
  render() {
    const sim = this.props.host;
    let className = 'lc-simulator-canvas';
    const { canvas = {}, viewport = {} } = sim.deviceStyle || {};
    if (sim.deviceClassName) {
      className += ` ${sim.deviceClassName}`;
    } else if (sim.device) {
      className += ` lc-simulator-device-${sim.device}`;
    }

    return (
      <div className={className} style={canvas}>
        <div className="lc-simulator-canvas-viewport" style={viewport} ref={(elmt) => sim.mountViewport(elmt)}>
          <BemTools host={sim} />
          <Content host={sim} />
          {/* <StatusBar host={sim} /> */}
        </div>
      </div>
    );
  }
}

@observer
class Content extends Component<{ host: BuiltinSimulatorHost }> {
  state = {
    disabledEvents: false,
  };

  private dispose?: () => void;

  componentDidMount() {
    const editor = globalContext.get('editor');
    const onEnableEvents = (type: boolean) => {
      this.setState({
        disabledEvents: type,
      });
    };

    editor.on('designer.builtinSimulator.disabledEvents', onEnableEvents);

    this.dispose = () => {
      editor.removeListener('designer.builtinSimulator.disabledEvents', onEnableEvents);
    };
  }

  componentWillUnmount() {
    this.dispose?.();
  }

  render() {
    const sim = this.props.host;
    const { disabledEvents } = this.state;
    // const { viewport } = sim;
    const frameStyle: any = {
    //   transform: `scale(${viewport.scale})`,
    //   height: viewport.contentHeight,
    //   width: viewport.contentWidth,
    };
    if (disabledEvents) {
      frameStyle.pointerEvents = 'none';
    }
    // @ts-ignore
    if (sim.get('isSandpack')) {
      return (
        <div className="lc-simulator-content">
            <SandpackLayout>
              {/* <SandpackCodeEditor /> */}
              <SandpackPreview 
                startRoute="/sandpack" 
                ref={(previewRef: SandpackPreviewRef) => {
                  if (previewRef) {
                    const iframe = previewRef.getClient()?.iframe;

                    if (iframe) {
                      sim.mountContentFrame(iframe)
                    }
                  }
                }} 
              />
            </SandpackLayout>
        </div>
      )
    }
    return (
      <div className="lc-simulator-content">
        {
          sim.get('simulatorUrl') ? (
            <iframe
            src={sim.get('simulatorUrl')}
            name="SimulatorRenderer"
            className="lc-simulator-content-frame"
            style={frameStyle}
            ref={(frame) => sim.mountContentFrame(frame)}
          />
          ) : (
            <iframe
              name="SimulatorRenderer"
              className="lc-simulator-content-frame"
              style={frameStyle}
              ref={(frame) => sim.mountContentFrame(frame)}
            />
          )
        }
 
      </div>
    );
  }
}