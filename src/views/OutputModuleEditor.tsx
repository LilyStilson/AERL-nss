import React, { useEffect, useRef, useState } from "react"
import { getCurrent as getCurrentWindow } from "@tauri-apps/api/window"
import AppContainer from "../components/AppContainer"
import { Button, Card, Group, Modal, Paper, Tabs, TextInput, Textarea, Title } from "@mantine/core"
import { CloseIcon, ExpandIcon, MinimizeIcon, MinusIcon, PlusIcon } from "../components/Icons/Icons"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import SplitView from "../components/SplitView/SplitView"
import ListBox, { TListBoxSelectionHandle } from "../components/ListBox/ListBox"
import { OutputModule } from "../classes/Rendering"
import CircleIcon from "../components/Icons/CircleIcon"
import { useDisclosure } from "@mantine/hooks"
import useStateCallback from "../classes/useStateCallback"
import { ILauncherConfig, ISettingsObject, Settings, SettingsSchema } from "../classes/Settings"
// import { useSettings } from "../components/SettingsProvider"
import { UnlistenFn, emit, listen } from "@tauri-apps/api/event"

// getCurrentWindow().hide()
export default function OutputModuleEditor(): React.JSX.Element {
    const thisWindow = getCurrentWindow()

    let [settings, _setSettings] = useState(SettingsSchema.defaultObject()),
        [isWindowMaximized, setIsWindowMaximized] = useState(false),
        [currentOMs, setCurrentOMs] = useStateCallback(new Array<OutputModule>()),
        [selectedOM, setSelectedOM] = useState<OutputModule>(),
        [omAlreadyExists, setOmAlreadyExists] = useState(false),
        listBoxRef = useRef<TListBoxSelectionHandle>(null),
        [winDocEdited, setWinDocEdited] = useState(false),
        [opened, {open, close}] = useDisclosure()

    const setSettings = (action: React.SetStateAction<ISettingsObject>, emitEvent?: string) => {
        _setSettings(action)
        if (emitEvent)
            emit(emitEvent, { settings: settings.Current })
        console.debug("App.tsx :: Settings state changed", settings.Current)
    }

    thisWindow.onResized(async () => {
        setIsWindowMaximized(await thisWindow.isMaximized())
    })

    useEffect(() => {
        setWinDocEdited(JSON.stringify(currentOMs) !== JSON.stringify(settings.Current.OutputModules.Modules)) 
    }, [currentOMs, selectedOM])

    const possibleMaskParts = {
        project: ["[projectName]", "[compName]", "[renderSettingsName]", "[outputModuleName]", "[fileExtension]"],
        composition: ["[width]", "[height]", "[frameRate]", ],
        comp_time: ["[startFrame]", "[endFrame]", "[durationFrames]", "[#####]", "[startTimecode]", "[endTimecode]", "[durationTimecode]"],
        image: ["[channels]", "[projectColorDepth]", "[outputColorDepth]", "[compressor]", "[fieldOrder]", "[pulldownPhase]"],
        date: ["[projectFolder]", "[dateYear]", "[dateMonth]", "[dateDay]", "[timeHour]", "[timeMins]", "[timeSecs]", "[timeZone]"]
    }

    let omMaskRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (omMaskRef.current)
            omMaskRef.current.style.fontFamily = "monospace"
    }, [])

    useEffect(() => {
        console.log(settings.Current)
    }, [settings])

    // tauri om change subscription event
    
    useEffect(() => {
        let unlistenChanged: UnlistenFn | undefined
        (async () => {
            unlistenChanged = await listen<{settings: ISettingsObject}>("Settings::Changed", (event) => {
                console.log("Settings::Changed event received")
                setSettings(event.payload.settings)
            })
        })()
        return () => {
            if (unlistenChanged)
                console.warn("Unsubscribed from Settings::OutputModulesChanged event!")
            unlistenChanged?.call(null)
        }
    }, [])


    function generateButtons(source: string[]): React.JSX.Element {
        return (
            <div className="flex">
                {
                    source.map((item) => {
                        return <Button key={item} variant="light" size="sm" draggable="true" onDragStart={(event) => {
                            event.dataTransfer.setData("text", event.currentTarget.innerText)
                            event.dataTransfer.effectAllowed = "copy"
                        }}>{item}</Button>
                    })
                }
            </div>
        )
    }

    function alreadyExists(name: string): boolean {
        return currentOMs.some((item) => item.Module === name)
    }

    function saveBtnClick(): void {
        let result: OutputModule[] = []
        // recast everything to OM
        for (let om of currentOMs)
            result.push(new OutputModule(om.Module, om.Mask, om.IsImported))
        
        setSelectedOM(settings.Current.OutputModules.Modules[0])
        listBoxRef.current?.select(0)
        // TODO: changing settings here does not change them everywhere
        // despite the variable being the same throughout the app
        setSettings({ ...settings, Current: { ...settings.Current, OutputModules: {...settings.Current.OutputModules, Modules: result } } }, "Settings::OutputModulesChanged")
        // settings.save()
        // mainViewRef.current?.reload()
        // emit("Settings::ChildrenWindows", { settings: settings.Current })
        close()
        thisWindow.hide()
    }
    function resetBtnClick(): void {
        setCurrentOMs(settings.Current.OutputModules.Modules)
        setSelectedOM(settings.Current.OutputModules.Modules[0])
        listBoxRef.current?.select(0)
        close()
        thisWindow.hide()
    }

    return (
        <AppContainer theme={settings.Current.Style}>
            <ContentProvider style={{ width: "100%", padding: "8px" }}
                Header={
                    <Card shadow="sm" data-tauri-drag-region style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px" }}>
                        <Title order={4}>Output Module Editor</Title>
                        <div className="chrome">
                            <Button.Group>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    thisWindow.minimize()
                                }}>
                                    <MinimizeIcon size={12} filled respectsTheme />
                                </Button>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    thisWindow.toggleMaximize()
                                }}>
                                    <ExpandIcon size={12} filled alt={isWindowMaximized} respectsTheme/>
                                </Button>
                                <Button variant="subtle" color="red" onClick={async () => {
                                    if (winDocEdited) {
                                        // TODO
                                        // At the moment Tauri does not support dialogs with multiple buttons
                                        // defined by user. In this case, for saving dialog we would need
                                        // at least three buttons: "Save" "Don't Save" and "Cancel", but only
                                        // two buttons are available
                                        //
                                        //! tauri-apps/tauri issue: TBD
                                        //
                                        // workaround: use Mantine's Modal component 

                                        // if (await confirm("You have unsaved changes", { type: "info",  }))
                                        // thisWindow.hide()
                                        open()
                                    } else {
                                        thisWindow.hide()
                                    }
                                }}>
                                    {
                                        winDocEdited ? <CircleIcon filled respectsTheme size={14}/> : <CloseIcon size={14} filled respectsTheme />
                                    }
                                </Button>
                            </Button.Group>
                        </div>
                    </Card>
                }
                Content={
                    <Card shadow="sm" className="content-fixed">
                        <SplitView splitterPos="30%" style={{ height: "100%" }}
                            leftPane={
                                <div style={{ height: "100%" }}>
                                    <ListBox 
                                        ref={listBoxRef}
                                        items={settings.Current.OutputModules.Modules.map((item) => item.Module)} 
                                        onSelectionChange={(index) => {
                                            setSelectedOM(currentOMs[index])
                                            // listBoxRef.current?.select(index)
                                        }}
                                    />
                                </div>
                            }
                            rightPane={
                                // TODO: Fuck me...
                                <Paper className="paper" style={{ flexDirection: "column", alignItems: "stretch", height: "100%" }}>
                                    <TextInput label="Module name" spellCheck="false" error={omAlreadyExists} value={selectedOM?.Module} onChange={(event) => {
                                        const exists = alreadyExists(event.target.value)
                                        setOmAlreadyExists(exists)
                                        setSelectedOM((current) => {
                                            return {
                                                ...current!,
                                                Module: event.target.value || ""
                                            }
                                        })
                                        if (exists) return
                                        setCurrentOMs((current) => {
                                            return current.map((item) => {
                                                if (item.Module === selectedOM?.Module) {
                                                    return {
                                                        ...item,
                                                        Module: event.target.value || ""
                                                    }
                                                } else {
                                                    return item
                                                }
                                            })
                                        })
                                    }} />
                                    <Textarea ref={omMaskRef} label="Output file mask" spellCheck="false" placeholder="Type or drag values from the section bellow" value={selectedOM?.Mask} onChange={(event) => {
                                        setSelectedOM((current) => {
                                            return {
                                                ...current!,
                                                Mask: event.target.value || ""
                                            }
                                        })
                                        setCurrentOMs((current) => {
                                            return current.map((item) => {
                                                if (item.Module === selectedOM?.Module) {
                                                    return {
                                                        ...item,
                                                        Mask: event.target.value || ""
                                                    }
                                                } else {
                                                    return item
                                                }
                                            })
                                        })
                                    }} />
                                    <Tabs defaultValue="project" style={{ height: "100%", margin: "8px 0" }}>
                                        <Tabs.List>
                                            <Tabs.Tab value="project">Project</Tabs.Tab>
                                            <Tabs.Tab value="composition">Composition</Tabs.Tab>
                                            <Tabs.Tab value="comp_time">Composition Time</Tabs.Tab>
                                            <Tabs.Tab value="image">Image</Tabs.Tab>
                                            <Tabs.Tab value="date">Date</Tabs.Tab>
                                        </Tabs.List>

                                        <Tabs.Panel value="project">
                                            {generateButtons(possibleMaskParts.project)}
                                        </Tabs.Panel>

                                        <Tabs.Panel value="composition">
                                            {generateButtons(possibleMaskParts.composition)}
                                        </Tabs.Panel>

                                        <Tabs.Panel value="comp_time">
                                            {generateButtons(possibleMaskParts.comp_time)}
                                        </Tabs.Panel>

                                        <Tabs.Panel value="image">
                                            {generateButtons(possibleMaskParts.image)}
                                        </Tabs.Panel>

                                        <Tabs.Panel value="date">
                                            {generateButtons(possibleMaskParts.date)}
                                        </Tabs.Panel>
                                    </Tabs>
                                </Paper>
                            }
                        />
                    </Card>
                }
                Footer={
                    <Card shadow="sm" style={{ padding: "8px", display: "flex" }}>
                        <Group>
                            <Button variant="default" className="btn-small" onClick={() => {
                                setCurrentOMs((current) => {
                                    return [...current, new OutputModule("Untitled output module", "", false)]
                                }, (state) => {
                                    listBoxRef.current?.select((state?.length ?? currentOMs.length) - 1)
                                    setSelectedOM(currentOMs[(state?.length ?? currentOMs.length) - 1])
                                })
                                // setSelectedOM(currentOMs[currentOMs.length])
                                
                            }}><PlusIcon respectsTheme filled size={14} /></Button>
                            <Button variant="default" className="btn-small" onClick={() => {
                                setCurrentOMs((current) => {
                                    return current.filter((item) => item.Module !== selectedOM?.Module)
                                }, () => {
                                    // select previous item
                                    listBoxRef.current?.select(currentOMs.findIndex((item) => item.Module === selectedOM?.Module) - 1)
                                    setSelectedOM(currentOMs.find((item) => item.Module === selectedOM?.Module))
                                })
                                
                            }}><MinusIcon respectsTheme filled size={14} /></Button>
                            
                        </Group>
                        <Group spacing="8px" position="apart" style={{ marginLeft: "32px", flexGrow: "1" }}>
                            <Button variant="filled" disabled={!winDocEdited} onClick={saveBtnClick}>Save</Button>
                            <Button variant="default" style={{ marginLeft: "8px" }} onClick={resetBtnClick}>Cancel</Button>
                        </Group>
                    </Card>       
                }
            />

            <Modal opened={opened} onClose={close} title="Output modules were modified. Save changes?" centered closeOnEscape={false} withCloseButton={false}>
                <Group position="right">
                    <Button variant="filled" onClick={saveBtnClick}>Save</Button>
                    <Button variant="default" onClick={resetBtnClick}>Don't save</Button>
                    <Button variant="default" onClick={close}>Cancel</Button>
                </Group>
            </Modal>
        </AppContainer>
    )
}