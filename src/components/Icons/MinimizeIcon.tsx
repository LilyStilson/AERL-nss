import IDefaultIconsProps from "./interface/IDefaultIconsProps";
import IconBase from "./IconBase";

export default function MinimizeIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 600 600">
            <path d="m600 225 0 150-600 0 0-150z" />
        </IconBase>
    )
}