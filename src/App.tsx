import "./App.css"
import { Card, Button } from "@mantine/core"
import { WebviewWindow, appWindow } from '@tauri-apps/api/window'
import MainView, { TMainViewHandle } from "./views/MainView"
import MenuBar from "./components/MenuBar/MenuBar"
import { CloseIcon, ExpandIcon, MinimizeIcon } from "./components/Icons/Icons"
import { useEffect, useRef, useState } from "react"
import { Theme } from "./classes/Helpers/Enums";
import { LauncherLogoIcon } from "./components/Icons/Icons"
import { ILauncherConfig, ISettingsObject, Settings, SettingsSchema } from "./classes/Settings"
import AppContainer from "./components/AppContainer"
import ColorSchemeIcon from "./components/Icons/ColorSchemeIcon"
// import { useSettings } from "./components/SettingsProvider"
import { UnlistenFn, listen } from "@tauri-apps/api/event"
import { emit } from "@tauri-apps/api/event"

export default function App() {
    let [settings, _setSettings] = useState<ISettingsObject>(SettingsSchema.defaultObject()),
        [isWindowMaximized, setIsWindowMaximized] = useState(false),
        [modalOpened, setModalOpened] = useState(false),
        [recentProjects, setRecentProjects] = useState<string[]>([])
        // [colorScheme, setColorScheme] = useState<Theme>(settings.Current?.Style ?? Theme.Dark)

    const setSettings = (action: React.SetStateAction<ISettingsObject>, emitEvent?: string) => {
        _setSettings(action)
        if (emitEvent)
            emit(emitEvent, { settings: settings.Current })
        console.debug("App.tsx :: Settings state changed", settings.Current)
    }

    let mainViewRef = useRef<TMainViewHandle>(null)

    appWindow.onResized(async () => {
        setIsWindowMaximized(await appWindow.isMaximized())
    })

    appWindow.onCloseRequested(async () => {
        Settings.save(settings)
    })

    useEffect(() => {
        (async () => {
            setSettings(await Settings.init())
            let _settings: ISettingsObject = SettingsSchema.defaultObject()

            try {
                _settings = await Settings.load(settings)
            } catch {
                try {
                    _settings = await Settings.loadLegacy(settings)
                } catch {
                    // yeet
                }
            }

            setSettings(_settings, "Settings::Changed")
            // emit("Settings::MainWindow", { settings: settings.Current })
            
            setRecentProjects(settings.Current.RecentProjects)
    
        })()

        return () => {
            // settings.save()
        }
    }, [])

    // tauri om change subscription event
    let unlisten: UnlistenFn | undefined
    useEffect(() => {
        (async () => {
            unlisten = await listen<{settings: ISettingsObject}>("Settings::OutputModulesChanged", (event) => {
                console.log("Settings::OutputModulesChanged event received")
                setSettings(event.payload.settings)
                Settings.save(settings)
            })
        })()
        return () => {
            if (unlisten)
                console.warn("Unsubscribed from Settings::OutputModulesChanged event!")
            unlisten?.call(null)
        }
    }, [])

    function appExit() {
        WebviewWindow.getByLabel("omeditor")?.close()
        appWindow.close()
    }
    
    return (
        <AppContainer theme={settings.Current.Style}>
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
                                            onClick: async () => {
                                                const om = WebviewWindow.getByLabel("omeditor")
                                                console.log(om)
                                                if (om) om.show()
                                                // mainViewRef.current?.openOMEditor()
                                            }
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
                                            onClick: appExit
                                        }
                                    ]
                                },
                                {
                                    name: "Tasks",
                                    children: [
                                        {
                                            name: "New Task",
                                            shortcut: { windows: "Ctrl+N", macos: "Cmd+N" },
                                            onClick: async () => mainViewRef.current?.newTask()
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
                                    // setColorScheme((colorScheme) => colorScheme === Theme.Light ? Theme.Dark : Theme.Light)
                                    setSettings({ ...settings, Current: { ...settings.Current, Style: settings.Current.Style === Theme.Light ? Theme.Dark : Theme.Light } }, "Settings::Changed")
                                }}><ColorSchemeIcon size={24} filled respectsTheme alt={settings.Current.Style === Theme.Light} /></Button>
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
                                <Button variant="subtle" color="red" onClick={appExit}>
                                    <CloseIcon size={14} filled respectsTheme />
                                </Button>
                            </Button.Group>
                        </div>
                    </Card>
                </div>
                <div style={{ flex: "2 0", height: "100%", marginTop: "8px" }}>
                    <MainView ref={mainViewRef} callback={(sender: unknown) => {
                        if (typeof(sender) == "boolean") {
                            setModalOpened(sender as boolean)
                        }
                    }} settings={[settings, setSettings]} />
                </div>
            </div>
        </AppContainer>
    )
}