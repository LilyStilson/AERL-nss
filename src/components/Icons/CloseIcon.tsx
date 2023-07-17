import IDefaultIconsProps from "./IDefaultIconsProps";
import IconBase from "./IconBase";

export default function CloseIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 128 128">
            <path d="m9 26.5 20-20 35 35 35-35 20 20-35 35 35 40-20 20c-39.782-39.782-21.667-21.667-35-35l-35 35-20-20 35-35-35-40z" />
        </IconBase>
    )
}