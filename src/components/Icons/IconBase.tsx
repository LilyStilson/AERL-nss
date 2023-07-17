import { useMantineTheme } from "@mantine/core";
import IDefaultIconsProps from "./IDefaultIconsProps";

interface IBaseIconProps extends IDefaultIconsProps {
    viewBox: string;
}

export default function IconBase(props: IBaseIconProps) {
    const theme = useMantineTheme()
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size}
            height={props.size}
            style={props.style}
            fill={
                props.respectsTheme 
                ? theme.colorScheme === "dark" 
                    ? theme.white 
                    : theme.black 
                : props.color
            }
            viewBox={props.viewBox}
        >
            {props.children}
        </svg>
    )
}