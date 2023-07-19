import IVariantIconProps from "./interface/IVariantIconProps";
import IconBase from "./IconBase";

export default function ArrowIcon(props: IVariantIconProps) {
    return (
        <IconBase {...props} viewBox="0 0 24 24">
            {   
                props.alt 
                    ? <path d="M6 9l6 6l6 -6" />
                    : <path d="m9 18 6-6-6-6" />
            }
        </IconBase>
    )
}