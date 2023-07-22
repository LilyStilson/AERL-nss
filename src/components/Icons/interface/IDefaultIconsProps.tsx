import IBaseIconProps from "./IBaseIconProps";

export default interface IDefaultIconsProps extends IBaseIconProps {
    filled?: boolean
    fillColor?: string
    stroked?: boolean
    strokeColor?: string
    respectsTheme?: boolean
}