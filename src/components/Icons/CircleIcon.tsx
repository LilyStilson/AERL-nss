import IDefaultIconsProps from "./interface/IDefaultIconsProps"
import IconBase from "./IconBase"

export default function CircleIcon(props: IDefaultIconsProps) {
    return (
        <IconBase {...props} viewBox="0 0 24 24">
            <path d="M18 12.009C18 15.323 15.314 18.009 12 18.009 8.686 18.009 6 15.323 6 12.009 6 8.695 8.686 6.009 12 6.009 15.314 6.009 18 8.695 18 12.009ZM12 2.009C6.477 2.009 2 6.486 2 12.009 2 17.532 6.477 22.009 12 22.009 17.523 22.009 22 17.532 22 12.009 22 6.486 17.523 2.009 12 2.009ZM24 12C24 18.627 18.627 24 12 24 5.373 24 0 18.627 0 12 0 5.373 5.373 0 12 0 18.627 0 24 5.373 24 12Z" />
        </IconBase>
    )
}