import "./App.css"
import { Card,  MantineProvider, Button } from "@mantine/core"
import { MantineThemeComponents } from "@mantine/styles/lib/theme/types/MantineTheme"
import { appWindow } from '@tauri-apps/api/window'
import MainView from "./views/MainView"
import MenuBar from "./components/MenuBar/MenuBar"
import { CloseIcon, ExpandIcon, MinimizeIcon } from "./components/Icons/Icons"
import { CSSProperties, useEffect, useState } from "react"
import { Platform, GetPlatform } from "./classes/Helpers/Platform"
import { Theme } from "./classes/Helpers/Enums";
import { LauncherLogoIcon } from "./components/Icons/Icons"
import settings from "./classes/Settings"

export default function App() {
    // TS limitations 101
    const colorScheme: Theme = Theme.Dark as Theme

    const ComponentsDefinitions: MantineThemeComponents = {
        Button: { defaultProps: { size: "md" } },
        TextInput: { defaultProps: { size: "md" } },
        NumberInput: { defaultProps: { size: "md" } },
        Checkbox: { defaultProps: { size: "md" } },
        Text: { defaultProps: { size: "md" } },
        Title: { defaultProps: { color: colorScheme == Theme.Light ? "black" : "white" } },
        Select: { defaultProps: { size: "md", } },
        Card: { defaultProps: { withBorder: colorScheme == Theme.Light } },
        Paper: { defaultProps: { withBorder: colorScheme == Theme.Light } },
        Slider: { defaultProps: { size: "md" } },
    }

    let [isWindowMaximized, setIsWindowMaximized] = useState(false);
    let [modalOpened, setModalOpened] = useState(false);
    let [recentProjects, setRecentProjects] = useState<string[]>([])

    appWindow.onResized(async () => {
        setIsWindowMaximized(await appWindow.isMaximized())
    })

    useEffect(() => {
        (async () => {
            await settings.init()
            if (!settings.isLoaded) 
                if (!await settings.tryLoad()) 
                    if (!await settings.tryLoadLegacy())
                        await settings.reset()
            
            setRecentProjects(settings.Current.RecentProjects)
        
            console.log(settings)
        })()

        return () => {
            settings.save()
        }
    }, [])
    
    return (
        <div className="app-container">
            <MantineProvider withCSSVariables withGlobalStyles withNormalizeCSS theme={{ 
                colorScheme: colorScheme, 
                components: ComponentsDefinitions
            }}>

                <div style={{ display: "flex", width: "100%", flexWrap: "nowrap", flexDirection: "column", margin: "8px" }}>
                    <div style={{ flex: "0 1" }}>
                        <Card shadow="sm" className="titlebar" data-tauri-drag-region>
                            <div className="menubar">
                                <MenuBar variant="subtle" position="bottom-start" disabled={modalOpened} menuItems={[
                                    {
                                        name: "AErender Launcher",
                                        appButton: true,
                                        icon: <LauncherLogoIcon size={24} />,
                                        children: [
                                            {
                                                name: "Output Module Editor",
                                                shortcut: { windows: "Ctrl+O", macos: "Cmd+O" },
                                            },
                                            {
                                                name: "Settings",
                                                shortcut: { windows: "Ctrl+P", macos: "Cmd+P" },
                                            },
                                            {
                                                name: "About AErender Launcher",
                                                shortcut: { windows: "F12" },
                                            }
                                        ]
                                    },
                                    {
                                        name: "File",
                                        children: [
                                            {
                                                name: "Recent projects",
                                                // TODO: temp data to test menu spawning
                                                children: recentProjects.map((project) => { return { name: project } })
                                            },
                                            {
                                                name: "Import Configuration",
                                                shortcut: { windows: "Ctrl+I", macos: "Cmd+I" },
                                            },
                                            {
                                                name: "Export Configuration",
                                                shortcut: { windows: "Ctrl+E", macos: "Cmd+E" },
                                            },
                                            {
                                                name: "Exit",
                                                shortcut: { windows: "Alt+F4", macos: "Cmd+Q" },
                                                onClick: () => appWindow.close()
                                            }
                                        ]
                                    },
                                    {
                                        name: "Tasks",
                                        children: [
                                            {
                                                name: "New Task",
                                                shortcut: { windows: "Ctrl+N", macos: "Cmd+N" },
                                            },
                                            {
                                                name: "Edit Task",
                                                shortcut: { windows: "Ctrl+R", macos: "Cmd+R" },
                                            },
                                            {
                                                name: "Duplicate Task",
                                                shortcut: { windows: "Ctrl+D", macos: "Cmd+D" },
                                            },
                                            {
                                                name: "Delete Task",
                                                shortcut: { windows: "Delete", macos: "Backspace" },
                                            }
                                        ]
                                    },
                                    {
                                        name: "Help",
                                        children: [
                                            {
                                                name: "Documentation",
                                                shortcut: { windows: "F1" },
                                            }
                                        ]
                                    }
                                ]} />
                            </div>
                            <div className="chrome">
                                <Button.Group>
                                    <Button variant="subtle" color="blue" onClick={() => {
                                        appWindow.minimize()
                                    }}>
                                        <MinimizeIcon size={12} filled respectsTheme />
                                    </Button>
                                    <Button variant="subtle" color="blue" onClick={() => {
                                        appWindow.toggleMaximize()
                                    }}>
                                        <ExpandIcon size={12} filled alt={isWindowMaximized} respectsTheme/>
                                    </Button>
                                    <Button variant="subtle" color="red" onClick={() => {
                                        appWindow.close()
                                    }}>
                                        <CloseIcon size={14} filled respectsTheme />
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