import React from "react"

export default interface IDefaultIconsProps {
    size?: number;
    filled?: boolean;
    fillColor?: string;
    stroked?: boolean;
    strokeColor?: string;
    respectsTheme?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}