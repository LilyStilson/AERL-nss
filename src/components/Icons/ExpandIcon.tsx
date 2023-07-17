import IVariantIconProps from "./IVariantIconProps";
import IconBase from "./IconBase";

export default function ExpandIcon(props: IVariantIconProps) {
    return (
        <IconBase {...props} viewBox="0 0 600 600">
            {   
                props.alt 
                    ? <path d="m600 600-600 0 0-600 150 150 0 300 300 0z" />
                    : <path d="m0 0 600 0 0 600-150-150 0-300-300 0z" />
            }
            
        </IconBase>
    )
}