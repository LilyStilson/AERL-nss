import IDefaultIconsProps from "./IDefaultIconsProps";
import IconBase from "./IconBase";

export default function PlusIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 12 12">
            <path d="m11.65 6.35-5.3 0 0 5.3-.7 0 0-5.3-5.3 0 0-.7 5.3 0 0-5.3.7 0 0 5.3 5.3 0 0 .7z" />
        </IconBase>
    )
}