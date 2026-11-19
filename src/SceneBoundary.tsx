import { Component, type ReactNode } from 'react';
export class SceneBoundary extends Component<{ children: ReactNode; room: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous: Readonly<{ children: ReactNode; room: string }>) {
    if (previous.room !== this.props.room && this.state.failed) this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? <p className="scene-fallback" role="status">The 3D view is unavailable on this device or connection. Continue with the complete lesson below.</p> : this.props.children;
  }
}
