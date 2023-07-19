import "./App.css"
import { Card,  MantineProvider, Button, Menu, Kbd } from "@mantine/core"
import { MantineThemeComponents } from "@mantine/styles/lib/theme/types/MantineTheme"
import { appWindow } from '@tauri-apps/api/window'
import TaskEditor from "./views/TaskEditor"
import MainView from "./views/MainView"
import ContentProvider from "./components/ContentProvider/ContentProvider"
import CloseIcon from "./components/Icons/CloseIcon"
import ExpandIcon from "./components/Icons/ExpandIcon"
import MinimizeIcon from "./components/Icons/MinimizeIcon"
import { CSSProperties, useCallback, useEffect, useState } from "react"
import { Platform, GetPlatform } from "./classes/Helpers/Platform"

enum Theme {
    Light = "light",
    Dark = "dark"
}

function App() {
    // TS limitations 101
    const colorScheme: Theme = Theme.Dark as Theme

    const ComponentsDefinitions: MantineThemeComponents = {
        Button: { defaultProps: { size: "md" } },
        TextInput: { defaultProps: { size: "md" } },
        Checkbox: { defaultProps: { size: "md" } },
        Text: { defaultProps: { size: "md" } },
        Title: { defaultProps: { color: colorScheme == Theme.Light ? "black" : "white" } },
        Select: { defaultProps: { size: "md", } },
        Card: { defaultProps: { withBorder: colorScheme == Theme.Light } },
        Paper: { defaultProps: { withBorder: colorScheme == Theme.Light } },
    }

    const MenuButtonStyle: CSSProperties = {
        color: colorScheme == Theme.Light ? "black" : "white",
    }

    let [isWindowMaximized, setIsWindowMaximized] = useState(false);
    let [modalOpened, setModalOpened] = useState(false);

    appWindow.onResized(async () => {
        setIsWindowMaximized(await appWindow.isMaximized())
    })

    function Shortcut(windows: string, macos?: string): React.JSX.Element[] {
        let output: React.JSX.Element[] = []

        let parts = GetPlatform() == Platform.Windows 
            ? windows.split("+") 
            : macos !== undefined
                ? macos.split("+")
                : windows.split("+")

        for (let i = 0; i < parts.length; i++) {
            output.push(<Kbd key={i}>{parts[i]}</Kbd>)
            if (i != parts.length - 1)
                output.push(<>+</>) 
        }

        return output
    }

    function ShortcutProps(windows: string, macos?: string): { accessKey: string, rightSection: React.JSX.Element[] } {
        return {
            accessKey: GetPlatform() == Platform.Windows 
                ? windows 
                : macos !== undefined
                    ? macos
                    : windows,
            rightSection: Shortcut(windows, macos)
        }
    }

    return (
        <div className="app-container">
            <MantineProvider withCSSVariables withGlobalStyles withNormalizeCSS theme={{ 
                colorScheme: colorScheme, 
                components: ComponentsDefinitions
            }}>

            <div style={{ display: "flex", width: "100%", flexWrap: "nowrap", flexDirection: "column", margin: "8px" }}>
                <div style={{ flex: "0 1" }}>
                    <Card shadow="sm" className="titlebar" data-tauri-drag-region>
                        <div className="menubar" >
                            <Button.Group>
                                <Menu withinPortal position="bottom-start"> 
                                    <Menu.Target>                               
                                        <Button variant="subtle" style={{...MenuButtonStyle, fontWeight: "bold", fontSize: "14px"}} disabled={modalOpened}>AErender Launcher</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+O", "Cmd+O")}>Output Module Editor</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+P", "Cmd+P")}>Settings</Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item className="menu-item" {...ShortcutProps("F12")}>About AErender Launcher</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>                                

                                <Menu withinPortal position="bottom-start"> 
                                    <Menu.Target>                               
                                        <Button variant="subtle" style={MenuButtonStyle} disabled={modalOpened}>File</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item className="menu-item" >Recent projects</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+I", "Cmd+I")}>Import Configuration</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+E", "Cmd+E")}>Export Configuration</Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item className="menu-item" {...ShortcutProps("Alt+F4", "Cmd+Q")}>Exit</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>

                                <Menu withinPortal position="bottom-start"> 
                                    <Menu.Target>                               
                                        <Button variant="subtle" style={MenuButtonStyle} disabled={modalOpened}>Tasks</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+N", "Cmd+N")}>New Task</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+R", "Cmd+R")}>Edit Task</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Ctrl+D", "Cmd+D")}>Duplicate Task</Menu.Item>
                                        <Menu.Item className="menu-item" {...ShortcutProps("Delete", "Backspace")}>Delete Task</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>

                                <Menu withinPortal position="bottom-start"> 
                                    <Menu.Target>                               
                                        <Button variant="subtle" style={MenuButtonStyle} disabled={modalOpened}>Help</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item className="menu-item" {...ShortcutProps("F1")}>Documentation</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Button.Group>
                        </div>
                        <div className="chrome">
                            <Button.Group>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    appWindow.minimize()
                                }}>
                                    <MinimizeIcon size={12} color="white" respectsTheme />
                                </Button>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    appWindow.toggleMaximize()
                                }}>
                                    <ExpandIcon size={12} color="white" alt={isWindowMaximized} respectsTheme/>
                                </Button>
                                <Button variant="subtle" color="red" onClick={() => {
                                    appWindow.close()
                                }}>
                                    <CloseIcon size={14} color="white" respectsTheme />
                                </Button>
                            </Button.Group>
                        </div>
                    </Card>
                </div>
                <div style={{ flex: "2 0", height: "100%", marginTop: "8px" }}>
                    <MainView callback={(sender) => {
                        if (typeof(sender) == "boolean") {
                            setModalOpened(sender as boolean)
                        }
                    }} />
                </div>
            </div>
                
            </MantineProvider>
        </div>
    )
}

export default App;
