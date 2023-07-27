import React, { CSSProperties } from "react"
import { FloatingPosition } from "@mantine/core/lib/Floating";
import { Button, Kbd, Menu, MenuProps } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks";
import { Theme } from "../../classes/Helpers/Enums";
import { isNullOrEmpty } from "../../classes/Helpers/Functions";
import { GetPlatform, Platform } from "../../classes/Helpers/Platform";
import { ArrowIcon } from "../Icons/Icons";
import "./MenuBar.css"

interface IShortcut {
    windows: string
    macos?: string
}

interface IMenuItem {
    name: string
    key?: string
    icon?: React.JSX.Element
    appButton?: boolean
    disabled?: boolean
    shortcut?: IShortcut
    children?: IMenuItem[]
    onClick?: () => void
}

interface IMenuBarProps {
    menuItems: IMenuItem[]
    position?: FloatingPosition
    variant?: string
    disabled?: boolean
}


function Shortcut(windows: string, macos?: string): React.JSX.Element[] {
    let output: React.JSX.Element[] = []

    let parts = GetPlatform() == Platform.Windows
        ? windows.split("+")
        : macos !== undefined
            ? macos.split("+")
            : windows.split("+")

    for (let i = 0; i < parts.length; i++) {
        output.push(<Kbd key={`kbd-${i}-${parts[i]}`}>{parts[i]}</Kbd>)
        if (i != parts.length - 1)
            output.push(<>+</>)
    }

    return output
}

function ShortcutProps(props?: IShortcut): { accessKey: string, rightSection: React.JSX.Element[] } | undefined {
    if (props == undefined)
        return
    return {
        accessKey: GetPlatform() == Platform.Windows
            ? props.windows
            : props.macos !== undefined
                ? props.macos
                : props.windows,
        rightSection: [
            <div key={`shortcut-${props.windows}`} className="menu-item-shortcut">
                {Shortcut(props.windows, props.macos)}
            </div>
        ]
    }
}

/**
 * @brief A `<Button.Group />` with `<Menu />` elements inside it
 * @remarks If someone will be able to provide better implementation of this component, please do so!
 * @param props Default `<MenuBar />` props
 * @returns A `<MenuBar />` component
 * @todo that bloody `key` warning...
 */
export default function MenuBar(props: IMenuBarProps): React.JSX.Element {
    const MenuButtonStyle: CSSProperties = {
        color: useColorScheme() == Theme.Light ? "black" : "white",
    }

    function menu(target: React.JSX.Element, dropdown: React.JSX.Element[], props: MenuProps): React.JSX.Element {
        return (
            <Menu {...props}>
                <Menu.Target>
                    {target}
                </Menu.Target>
                <Menu.Dropdown>
                    {dropdown}
                </Menu.Dropdown>
            </Menu>
        )
    }

    function disable(isDisabled?: boolean): React.CSSProperties {
        return {
            visibility: isDisabled ? "hidden" : "visible",
            pointerEvents: isDisabled ? "none" : "auto",
            display: isDisabled ? "none" : undefined
        }
    }

    /** 
     * Function traverses the tree of menu items stored in `props.menuItems`.
     * It builds final array of `<Menu />` elements using recursion.
     * 
     * Due to Mantine's weird menu implementation we need 
     * to consider top level menu items slightly differently.
     * So, the top level menu is basically a `<Button />` with `<Menu />`
     * That's why we are building this menu inside a `<Button.Group />` with `withinPortal` prop
     */ 
    function buildMenu(item: IMenuItem, topLevel: boolean = false): React.JSX.Element {
        return (
            <Menu withinPortal position={props.position} disabled={props.disabled} key={`menu-${item.name}`} trigger="click">
                <Menu.Target>
                    {
                        topLevel 
                        // Top level menu items are just buttons
                        ? item.appButton 
                            ? <Button variant={props.variant} key={`menu-top-app-${item.name}`} leftIcon={item.icon} style={{...MenuButtonStyle, fontWeight: "bold", fontSize: "14px", ...disable(props.disabled)}}>{item.name}</Button>
                            : <Button variant={props.variant} key={`menu-top-${item.name}`} style={{...MenuButtonStyle, ...disable(props.disabled)}}>{item.name}</Button>
                        // Anything else could be another menu item
                        : <Menu withinPortal position="right-start" trigger="hover" key={`menu-sub-${item.name}`}>
                            <Menu.Target>
                                <Menu.Item className="menu-item" key={`menu-sub-item-${item.name}`} disabled={item.disabled} onClick={item.onClick} rightSection={<ArrowIcon size={12} stroked respectsTheme />}>{item.name}</Menu.Item>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {buildChildrenMenuElements(item)}
                            </Menu.Dropdown>
                        </Menu>
                    }
                </Menu.Target>
                <Menu.Dropdown>
                    {buildChildrenMenuElements(item)}
                </Menu.Dropdown>
            </Menu>
        )
    }

    function buildChildrenMenuElements(item: IMenuItem): React.JSX.Element[] | undefined {
        let result: React.JSX.Element[] = []

        if (isNullOrEmpty(item.children))
            return

        for (let i = 0; i < item.children!.length; i++) {
            let child = item.children![i]
            if (isNullOrEmpty(child.children)) {
                // If this is a leaf node, then we can just build a menu item
                result.push(
                    <Menu.Item
                        key={`menu-item-${item.name}-${i}`}
                        className="menu-item"
                        disabled={child.disabled}
                        onClick={child.onClick}
                        {...ShortcutProps(child.shortcut)}
                    >
                        {child.name}
                    </Menu.Item>
                )
            } else {
                // If this is not a leaf node, then we need to build a menu
                // and then add it to the result array
                result.push(menu(
                    <Menu.Item className="menu-item" key={`menu-item-${child.name}-${i}`} disabled={child.disabled} onClick={child.onClick} rightSection={<ArrowIcon size={12} stroked respectsTheme />}>{child.name}</Menu.Item>,
                    buildChildrenMenuElements(child)!,
                    {...{
                        trigger: "hover",
                        position: "right-start",
                        className: "menu-item",
                        // disabled: child.disabled,
                        key: `menu-${child.name}`,
                        onClick: child.onClick,
                        ...ShortcutProps(child.shortcut)
                    }}
                ))

            }
        }

        return result
    }


    return (
        <Button.Group>
            {
                props.menuItems.map((item) => buildMenu(item, true))
            }
        </Button.Group>
    )
}