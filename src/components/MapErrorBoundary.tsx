import React, { ErrorInfo, ReactNode } from "react";
import { InteractiveFallbackMap } from "./InteractiveFallbackMap";

interface Props {
  children: ReactNode;
  userCoords?: { lat: number; lng: number } | null;
  onMarkerSelect?: (place: any) => void;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Map render issue caught by MapErrorBoundary:", error.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <InteractiveFallbackMap 
          userLocation={this.props.userCoords || { lat: 20.5937, lng: 78.9629 }} 
          onMarkerSelect={this.props.onMarkerSelect}
        />
      );
    }

    return this.props.children;
  }
}
