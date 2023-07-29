import { Composition, FrameSpan, OutputModule, RenderSettings, RenderTask } from "../classes/Rendering"
import { useState, useEffect } from "react"
import { Button, Card, Paper, Select, TextInput, Title, Grid, Stack, Checkbox, Text, Divider, Center, NumberInput, Group, ScrollArea, Slider, ActionIcon } from "@mantine/core"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { save } from "@tauri-apps/api/dialog"
import Pager from "../components/Pager/Pager"
import { EditorSender } from "../classes/Helpers/Enums"
import PlusIcon from "../components/Icons/PlusIcon"
import { tryParseNumber } from "../classes/Helpers/Functions"
import settings from "../classes/Settings"
import MinusIcon from "../components/Icons/MinusIcon"
import { invoke } from "@tauri-apps/api"

interface ITaskEditorProps {
    sender: string
    task: RenderTask
    callback?: (task?: RenderTask) => void
}

export default function TaskEditor(props: ITaskEditorProps) {
    let [task, setTask] = useState(props.task)

    let [page, setPage] = useState(0)
    let [compList, setCompList] = useState<Composition[]>([])

    let outputModules: OutputModule[] = [
        OutputModule.Default.Lossless,
        new OutputModule("Lossless with Alpha", "[compName].[fileExtension]", false)
    ]
    
    let [renderSettings, setRenderSettings] = useState([
        RenderSettings.Default.BestSettings,
        RenderSettings.Default.CurrentSettings,
        RenderSettings.Default.DVSettings,
        RenderSettings.Default.DraftSettings,
        RenderSettings.Default.MultiMachineSettings,
    ])
    
    function calcMemory(props: { mem?: number, percent?: number }): number {
        if (props.mem !== undefined) 
            return Math.round(props.mem / (settings.System.Memory / 1024 / 1024) * 100)
        if (props.percent !== undefined)
            return Math.round((props.percent / 100) * (settings.System.Memory / 1024 / 1024))

        return -1
    }

    function generateMemoryMarks() {
        let result = []
        for (let i = 1024; i <= settings.System.Memory / 1024 / 1024; i *= 2) {
            result.push({ value: calcMemory({ mem: i }), label: `${i / 1024} GB` })
        }
        return result
    }

    let [CustomPropsEnabled, setCustomPropsEnabled] = useState(task.CustomProperties !== "")
    let [cacheLimitText, setCacheLimitText] = useState(`${task.CacheLimit}%`)
    let [memLimitText, setMemLimitText] = useState(`${calcMemory({ percent: task.MemoryLimit })} MB`)

    const AddCompButton = (
        <div className="row" key={`add-comp-btn`}>
            <Button fullWidth leftIcon={<PlusIcon filled fillColor="white" size={20}/>} onClick={() => {
                setCompList((current) => [...current, new Composition("New comp", new FrameSpan(0, 100), 1)])
            }}>
                <Center>Add comp</Center>
            </Button>
        </div>
    )

    return (
        <Card className="popup">
            <Pager page={page}>
                <ContentProvider style={{ width: "100%", padding: "8px" }} 
                    Header={
                        <Paper className="paper">
                            <Title order={4} className="title">Project Setup</Title>
                            <TextInput value={task.Project} style={{ flex: "1 0", marginLeft: "32px" }} readOnly />
                        </Paper>
                    }
                    Content={
                        <Paper className="content">
                            {/* Output path */}
                            <div className="row">
                                <Text style={{ width: "96px" }}>Output path</Text>
                                <TextInput style={{ flex: "1 0", marginLeft: "8px" }} value={task.Output} onChange={(event) => setTask((current) => {
                                    return { ...current, Output: event.target.value ?? "" }
                                })}/>
                                <Button variant="subtle" style={{ marginLeft: "8px" }} onClick={async () => {
                                    const file = await save({
                                        filters: [{
                                            name: 'Video file',
                                            extensions: ['[fileExtension]']
                                        }]
                                    })

                                    if (file !== null) {
                                        setTask((current) => {
                                            return { ...current, Output: file as string}
                                        })
                                        settings.Current.LastOutputPath = file as string
                                        // settings.Current.TemporarySavePath
                                    }
                                }}>Choose file...</Button>
                            </div>
                            
                            {/* Output Module */}
                            <div className="row">
                                <Text style={{ width: "96px" }}>Output module</Text>
                                <Select style={{ flex: "1 0", marginLeft: "8px" }} data={settings.Current.OutputModules.Modules.map((m) => m.Module)} value={task.OutputModule.Module} onChange={
                                    (value) => {
                                        let module = settings.Current.OutputModules.Modules.find((m) => m.Module === value)
                                        if (module !== undefined) {
                                            setTask((current) => {
                                                return { ...current, OutputModule: module as OutputModule }
                                            })
                                            settings.Current.OutputModules.Selected = settings.Current.OutputModules.Modules.indexOf(module as OutputModule)
                                        }
                                    }
                                }/>
                            </div> 
                            
                            {/* Render settings */}
                            <div className="row">
                                <Text style={{ width: "96px" }}>Render settings</Text>
                                <Select style={{ flex: "1 0", marginLeft: "8px" }} searchable creatable data={renderSettings} value={task.RenderSettings}
                                    onChange={(value) => {
                                        let s = renderSettings.find((s) => s === value)
                                        if (s !== undefined) {
                                            setTask((current) => {
                                                return { ...current, RenderSettings: s! }
                                            })
                                            settings.Current.RenderSettings = s!
                                        }
                                    }}
                                    getCreateLabel={(query) => `+ ${query}`}
                                    onCreate={(query) => {
                                        const item = query;
                                        setRenderSettings((current) => [...current, item]);
                                        setTask((current) => { return { ...current, RenderSettings: item } })
                                        return item;
                                    }} />
                            </div>

                            {/* Properties */}
                            <Card style={{ padding: "8px", marginBottom: "8px", height: "auto" }}>
                                <Text size="md">Properties</Text>
                                <Divider my="sm" />
                                <Grid columns={2}>
                                    <Grid.Col span="auto">
                                        <Stack spacing="xs">
                                            <Checkbox label="Play sound on render finish" checked={task.Sound} onChange={(event) => setTask((current) => { 
                                                settings.Current.Sound = event.target.checked
                                                return { ...current, Sound: event.target.checked }
                                            })} />
                                            <Checkbox label="Use CPU multiprocessing" checked={task.Multiprocessing} onChange={(event) => setTask((current) => {
                                                settings.Current.Multithreaded = event.target.checked
                                                return { ...current, Multiprocessing: event.target.checked }
                                            })} />
                                            <Checkbox label="Render with missing files" checked={task.MissingFiles} onChange={(event) => setTask((current) => {
                                                settings.Current.MissingFiles = event.target.checked
                                                return { ...current, MissingFiles: event.target.checked }
                                            })} />
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span="auto">
                                        <Stack spacing="xs">
                                            <Checkbox label="Custom properties" checked={CustomPropsEnabled} onChange={() => { setCustomPropsEnabled(!CustomPropsEnabled) }} />
                                            <TextInput style={{ flex: "1 0" }} value={task.CustomProperties} disabled={!CustomPropsEnabled} onChange={(event) => setTask((current) => {
                                                settings.Current.CustomProperties = event.target.value
                                                return { ...current, CustomProperties: event.target.value }
                                            })}/>
                                        </Stack>
                                    </Grid.Col>
                                </Grid>                               
                            </Card>

                            {/* Cache limit */}
                            <div className="row">
                                <Text style={{ width: "96px" }}>Cache limit</Text>
                                <Slider style={{ flex: "1 0", marginLeft: "8px" }} min={1} marks={[{value: 25,label:"25%"},{value: 50,label:"50%"},{value: 75,label:"75%"}]} value={task.CacheLimit} onChange={(value) => {
                                    setCacheLimitText(`${value}%`)
                                    setTask((current) => {
                                        return { ...current, CacheLimit: value }
                                    })
                                    settings.Current.CacheLimit = value
                                }} />
                                <TextInput value={cacheLimitText} style={{ width: "96px", marginLeft: "8px" }} onChange={(event) => setCacheLimitText(event.target.value)} onKeyDown={(event) => {
                                    if (event.key == "Enter") {
                                        setCacheLimitText(`${event.target.value}%`)
                                        setTask((current) => {
                                            return { ...current, CacheLimit: tryParseNumber(event.target.value) ?? 0 }
                                        })
                                        settings.Current.CacheLimit = event.target.value
                                    }
                                }} />
                            </div>
                            
                            {/* Memory limit */}
                            <div className="row" style={{margin: "0"}}>
                                <Text style={{ width: "96px" }}>Memory limit</Text>
                                <Slider style={{ flex: "1 0", marginLeft: "8px" }} min={1} marks={generateMemoryMarks()} value={task.MemoryLimit} onChange={(value) => {
                                    setMemLimitText(`${calcMemory({ percent: value })} MB`)
                                    setTask((current) => {
                                        return { ...current, MemoryLimit: value }
                                    })
                                    settings.Current.MemoryLimit = value
                                }} />
                                <TextInput value={memLimitText} style={{ width: "96px", marginLeft: "8px" }} onChange={(event) => setMemLimitText(event.target.value)} onKeyDown={(event) => {
                                    if (event.key == "Enter") { 
                                        // TODO: event.target.value (Property 'value' does not exist on type 'EventTarget'.ts(2339))
                                        let currentText: string = event.target.value
                                        let currentNum: number = settings.System.Memory / 1024 / 1024

                                        if (currentText.toLowerCase().endsWith("mb")) {
                                            currentNum = tryParseNumber(currentText.substring(0, currentText.length - 2)) ?? currentNum
                                        }

                                        if (currentText.toLowerCase().endsWith("gb")) {
                                            currentText = currentText.substring(0, currentText.length - 2)
                                            currentNum = (tryParseNumber(currentText) ?? currentNum) * 1024
                                        }

                                        if (currentText.toLowerCase().endsWith("kb")) {
                                            currentText = currentText.substring(0, currentText.length - 2)
                                            currentNum = (tryParseNumber(currentText) ?? currentNum) / 1024
                                        }

                                        setMemLimitText(`${currentNum} MB`)
                                        setTask((current) => {
                                            return { ...current, MemoryLimit: calcMemory({ mem: currentNum }) }
                                        })
                                        settings.Current.MemoryLimit = calcMemory({ mem: currentNum })
                                    }
                                }} />
                            </div>
                        </Paper>
                    }
                    Footer={
                        <Paper className="paper">
                            <Button variant="default" onClick={() => {
                                props.callback?.call(null, undefined)
                            }}>Cancel</Button>
                            <Button variant="outline" onClick={async () => {
                                // TODO: IS ALIVE, ALIVEEE!
                                const result = await invoke<string>("parse_aep", { projectPath: task.Project })

                                console.log(JSON.parse(result))
                            }}>Try parse project</Button>
                            <Button variant="outline" onClick={() => {
                                setPage(1)
                            }}>Compositions {">>"}</Button>
                        </Paper>
                    }
                />
                <ContentProvider style={{ width: "100%", padding: "8px" }} 
                    Header={
                        <Paper className="paper">
                            <Title order={4} className="title">Compositions</Title>
                            {/* <NumberInput startValue={1} min={1} value={1} /> */}
                        </Paper>
                    }
                    Content={
                        <Paper className="content-fixed">
                            <ScrollArea style={{ height: "100%" }}>
                            { 
                                compList.length > 0 ? compList.map((comp, idx) => {
                                    let result: React.JSX.Element[] = []

                                    result.push(
                                        <div className="row" key={`new-comp-${idx}`}>
                                            <Card style={{ width: "100%", display: "flex", padding: "8px", gap: "8px" }}>
                                                <div className="flex-row" style={{ flex: "1 0" }}>
                                                    <TextInput label="Name:" style={{width:"100%"}} value={comp.Name} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Name = event.target.value ?? ""
                                                            return result
                                                        })
                                                    }} />
                                                </div>
                                                <div className="flex-row" style={{ flex: "0 2" }}>
                                                    <TextInput label="Start frame:" style={{ width: "72px" }} value={comp.Frames.StartFrame} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Frames.StartFrame = tryParseNumber(event.target.value) ?? result[idx].Frames.StartFrame
                                                            return result
                                                        })
                                                    }} />
                                                    <TextInput label="End frame:" style={{ width: "72px" }} value={comp.Frames.EndFrame} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Frames.EndFrame = tryParseNumber(event.target.value) ?? result[idx].Frames.EndFrame
                                                            return result
                                                        })
                                                    }} />
                                                    <NumberInput label="Split" style={{ width: "72px" }} min={1} value={comp.Split} onChange={(value) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Split = tryParseNumber(`${value}`) ?? 1
                                                            return result
                                                        })
                                                    }} />
                                                    <ActionIcon variant="default" onClick={() => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result.splice(idx, 1)
                                                            return result
                                                        })
                                                    }}><MinusIcon filled respectsTheme size={24}/></ActionIcon>
                                                </div>
                                            </Card>
                                        </div>
                                    )

                                    if (idx == compList.length - 1)
                                        result.push(
                                            AddCompButton
                                        )

                                    return result
                                }) : AddCompButton
                            }
                            </ScrollArea>
                        </Paper>
                    }
                    Footer={
                        <Paper className="paper">
                            <Group>
                                <Button variant="default" onClick={() => {
                                    props.callback?.call(null, undefined)
                                }}>Cancel</Button>
                                <Button variant="outline" onClick={() => {
                                    setPage(0)
                                }}>{"<<"}Project setup</Button>
                            </Group>
                            <Button variant="filled" onClick={() => {
                                //? workaround?
                                props.callback?.call(null, { ...task, Compositions: compList })
                            }}>{props.sender == EditorSender.TaskCreateButton ? "Create task" : "Save task"}</Button>
                        </Paper>
                    }
                />
            </Pager>
        </Card>
    );
}