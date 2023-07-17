import IDefaultIconsProps from "./IDefaultIconsProps";
import IconBase from "./IconBase";

export default function MinusIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 16 16">
            <path d="m14 8.4-12 0 0-.8 12 0 0 .8z" />
        </IconBase>
    )
}