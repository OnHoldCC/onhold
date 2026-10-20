export interface PreviewProps {
    className?: string;
    paused?: boolean;
    onNavigate?: (componentName: string, path?: string) => void;
    onAction?: (action: string) => void;
}
