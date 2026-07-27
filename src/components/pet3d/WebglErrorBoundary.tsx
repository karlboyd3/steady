"use client";

/* Catches any render-time failure inside the 3D canvas (a bad GLTF
 * parse, a three.js runtime error) and swaps to the 2D fallback rather
 * than leaving the pet screen white. React error boundaries must be
 * class components — there is no hook equivalent. */

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebglErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
