import IDefaultIconsProps from "./interface/IDefaultIconsProps";
import IconBase from "./IconBase";

export default function GripIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 24 24">
            <circle cx="9" cy="5"></circle>
            <circle cx="9" cy="12"></circle>
            <circle cx="9" cy="19"></circle>
            <circle cx="15" cy="5"></circle>
            <circle cx="15" cy="12"></circle>
            <circle cx="15" cy="19"></circle>
        </IconBase>
    )
}

