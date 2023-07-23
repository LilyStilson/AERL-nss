import { useMantineTheme } from "@mantine/core";
import IBaseIconProps from "./interface/IBaseIconProps";
import IDefaultIconsProps from "./interface/IDefaultIconsProps";

export function SvgBase(props: IBaseIconProps): React.JSX.Element {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size}
            height={props.size}
            style={props.style}
            viewBox={props.viewBox}
        >
            {props.children}
        </svg>
    )
}

export default function IconBase(props: IDefaultIconsProps) {
    const theme = useMantineTheme()
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size}
            height={props.size}
            style={props.style}
            stroke={
                props.stroked 
                ? props.respectsTheme && props.stroked
                    ? theme.colorScheme === "dark"
                        ? theme.white
                        : theme.black
                    : props.strokeColor   
                : "none"
            }
            fill={
                props.filled 
                ? props.respectsTheme
                    ? theme.colorScheme === "dark" 
                        ? theme.white 
                        : theme.black 
                    : props.fillColor
                :"none"
            }
            viewBox={props.viewBox}
        >
            {props.children}
        </svg>
    )
}