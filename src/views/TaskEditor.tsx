import { Composition, FrameSpan, OutputModule, RenderSettings, RenderTask } from "../classes/Rendering"
import { useState, useEffect } from "react"
import { Button, Card, Paper, Select, TextInput, Title, Grid, Stack, Checkbox, Text, Divider, Center, NumberInput, Group, ScrollArea, Slider } from "@mantine/core"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { save } from "@tauri-apps/api/dialog"
import Pager from "../components/Pager/Pager"
import { EditorSender } from "../classes/Helpers/Enums"
import PlusIcon from "../components/Icons/PlusIcon"
import { tryParseNumber } from "../classes/Helpers/Functions"

interface ITaskEditorProps {
    Sender: string
    Task: RenderTask
    Callback?: (Task: RenderTask, Changed: boolean) => void
}

export default function TaskEditor(props: ITaskEditorProps) {
    let [task, setTask] = useState(props.Task)

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
    
    let [CustomPropsEnabled, setCustomPropsEnabled] = useState(task.CustomProperties !== "")
    let [cacheLimitText, setCacheLimitText] = useState(`${task.CacheLimit}%`)
    let [memLimitText, setMemLimitText] = useState(`${task.MemoryLimit} MB`)

    // useEffect(() => {
    //     console.log(task)
    //     console.log(compList)
    // }, [task, compList])

    const AddCompButton = (
        <div className="row">
            <Button fullWidth leftIcon={<PlusIcon filled fillColor="white" size={20}/>} onClick={() => {
                setCompList((current) => [...current, new Composition("New comp", new FrameSpan(0, 100), 1)])
            }}>
                <Center>Add comp</Center>
            </Button>
        </div>
    )

    return (
        <Card style={{ display: "flex", width: "640px", height: "480px", padding: "0", boxShadow: "0px 8px 48px 0px rgba(0,0,0,0.5)" }}>
            <Pager page={page}>
                <ContentProvider style={{ width: "100%", padding: "8px" }} 
                    Header={
                        <Paper shadow="sm" style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                            <Title order={4} style={{ fontWeight: "bold", marginLeft: "8px" }}>Project Setup</Title>
                            <TextInput value={task.Project} style={{ flex: "1 0", marginLeft: "32px" }} readOnly />
                        </Paper>
                    }
                    Content={
                        <Paper shadow="sm" style={{ padding: "8px" }}>
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
                                    }
                                }}>Choose file...</Button>
                            </div>
                            
                            <div className="row">
                                <Text style={{ width: "96px" }}>Output module</Text>
                                <Select style={{ flex: "1 0", marginLeft: "8px" }} data={outputModules.map((m) => m.Module)} value={task.OutputModule.Module} onChange={
                                    (value) => {
                                        let module = outputModules.find((m) => m.Module === value)
                                        if (module !== undefined) {
                                            setTask((current) => {
                                                return { ...current, OutputModule: module as OutputModule }
                                            })
                                        }
                                    }
                                }/>
                            </div> 
                            
                            <div className="row">
                                <Text style={{ width: "96px" }}>Render settings</Text>
                                <Select style={{ flex: "1 0", marginLeft: "8px" }} searchable creatable data={renderSettings} value={task.RenderSettings}
                                    onChange={(value) => {
                                        let settings = renderSettings.find((s) => s === value)
                                        if (settings !== undefined) {
                                            setTask((current) => {
                                                return { ...current, RenderSettings: settings! }
                                            })
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

                            <Card style={{ padding: "8px", marginBottom: "8px", height: "auto" }}>
                                <Text size="md">Properties</Text>
                                <Divider my="sm" />
                                <Grid columns={2}>
                                    <Grid.Col span="auto">
                                        <Stack spacing="xs">
                                            <Checkbox label="Play sound on render finish" checked={task.Sound} onChange={(event) => setTask((current) => { 
                                                return { ...current, Sound: event.target.checked }
                                            })} />
                                            <Checkbox label="Use CPU multiprocessing" checked={task.Multiprocessing} onChange={(event) => setTask((current) => {
                                                return { ...current, Multiprocessing: event.target.checked }
                                            })} />
                                            <Checkbox label="Render with missing files" checked={task.MissingFiles} onChange={(event) => setTask((current) => {
                                                return { ...current, MissingFiles: event.target.checked }
                                            })} />
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span="auto">
                                        <Stack spacing="xs">
                                            <Checkbox label="Custom properties" checked={CustomPropsEnabled} onChange={() => { setCustomPropsEnabled(!CustomPropsEnabled) }} />
                                            <TextInput style={{ flex: "1 0" }} value={task.CustomProperties} disabled={!CustomPropsEnabled} onChange={(event) => setTask((current) => {
                                                return { ...current, CustomProperties: event.target.value ?? "" }
                                            })}/>
                                        </Stack>
                                    </Grid.Col>
                                </Grid>                               
                            </Card>

                            <div className="row">
                                <Text style={{ width: "96px" }}>Cache limit</Text>
                                <Slider style={{ flex: "1 0", marginLeft: "8px" }} value={task.CacheLimit} onChange={(value) => {
                                    setCacheLimitText(`${value}%`)
                                    setTask((current) => {
                                        return { ...current, CacheLimit: value }
                                    })
                                }} />
                                <TextInput value={cacheLimitText} style={{ width: "96px", marginLeft: "8px" }} onChange={(event) => setCacheLimitText(event.target.value)} onKeyDown={(event) => {
                                    console.log(event)
                                    if (event.key == "Enter") {
                                        setCacheLimitText(`${event.target.value}%`)
                                        setTask((current) => {
                                            return { ...current, CacheLimit: tryParseNumber(event.target.value) ?? 0 }
                                        })
                                    }
                                }} />
                            </div>

                            <div className="row" style={{margin: "0"}}>
                                <Text style={{ width: "96px" }}>Memory limit</Text>
                                <Slider style={{ flex: "1 0", marginLeft: "8px" }} value={task.MemoryLimit} onChange={(value) => {
                                    setMemLimitText(`${value}%`)
                                    setTask((current) => {
                                        return { ...current, MemoryLimit: value }
                                    })
                                }} />
                                <TextInput value={memLimitText} style={{ width: "96px", marginLeft: "8px" }} onChange={(event) => setMemLimitText(event.target.value)} onKeyDown={(event) => {
                                    if (event.key == "Enter") {
                                        let current: string = event.target.value
                                        let currentNum: number //TODO: find out how much memory a pc has 

                                        if (current.toLowerCase().endsWith("mb")) {
                                            currentNum = tryParseNumber(current.substring(0, current.length - 2)) ?? currentNum
                                        }

                                        if (current.toLowerCase().endsWith("gb")) {
                                            current = current.substring(0, current.length - 2)
                                            current = `${parseInt(current) * 1024}`
                                        }

                                        if (current.toLowerCase().endsWith("kb")) {
                                            current = current.substring(0, current.length - 2)
                                            current = `${parseInt(current) / 1024}`
                                        }

                                        setMemLimitText(`${event.target.value}%`)
                                        setTask((current) => {
                                            return { ...current, MemoryLimit: tryParseNumber(event.target.value) ?? 0 }
                                        })
                                    }
                                }} />
                            </div>
                        </Paper>
                        
                    }
                    Footer={
                        <Paper shadow="sm" style={{ display: "flex", justifyContent: "space-between", padding: "8px" }}>
                            <Button variant="default" onClick={() => {
                                props.Callback?.call(null, task, false)
                            }}>Cancel</Button>
                            <Button variant="outline" onClick={() => {
                                setPage(1)
                            }}>Compositions {">>"}</Button>
                        </Paper>
                    }
                />
                <ContentProvider style={{ width: "100%", padding: "8px" }} 
                    Header={
                        <Paper shadow="sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px" }}>
                            <Title order={4} style={{ fontWeight: "bold", marginLeft: "8px" }}>Compositions</Title>
                            {/* <NumberInput startValue={1} min={1} value={1} /> */}
                        </Paper>
                    }
                    Content={
                        <Paper shadow="sm" style={{ padding: "8px", height: "100%", overflowY: "scroll" }}>
                            <ScrollArea>
                            { 
                                compList.length > 0 ? compList.map((comp, idx) => {
                                    let result: React.JSX.Element[] = []

                                    result.push(
                                        <div className="row">
                                            <Card style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "8px" }}>
                                                <div className="flex-row">
                                                    {/* <Text style={{ marginRight: "8px" }}>Name: </Text> */}
                                                    <TextInput label="Name:" value={comp.Name} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Name = event.target.value ?? ""
                                                            return result
                                                        })
                                                    }} />
                                                </div>
                                                <div className="flex-row">
                                                    <TextInput label="Start frame:" value={comp.Frames.StartFrame} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Frames.StartFrame = tryParseNumber(event.target.value) ?? result[idx].Frames.StartFrame
                                                            return result
                                                        })
                                                    }} />
                                                    <TextInput label="End frame:" value={comp.Frames.EndFrame} onChange={(event) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Frames.EndFrame = tryParseNumber(event.target.value) ?? result[idx].Frames.EndFrame
                                                            return result
                                                        })
                                                    }} />
                                                </div>
                                                <div className="flex-row">
                                                    <NumberInput label="Split" min={1} value={comp.Split} onChange={(value) => {
                                                        setCompList((current) => {
                                                            let result = [...current]
                                                            result[idx].Split = parseInt(`${value}`) ?? 1
                                                            return result
                                                        })
                                                    }} />

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
                        <Paper shadow="sm" style={{ display: "flex", justifyContent: "space-between", padding: "8px" }}>
                            <Group>
                                <Button variant="default" onClick={() => {
                                    props.Callback?.call(null, task, false)
                                }}>Cancel</Button>
                                <Button variant="outline" onClick={() => {
                                    setPage(0)
                                }}>{"<<"}Project setup</Button>
                            </Group>
                            <Button variant="filled" onClick={() => {
                                //? workaround?
                                props.Callback?.call(null, { ...task, Compositions: compList }, true)
                            }}>{props.Sender == EditorSender.TaskCreateButton ? "Create task" : "Save task"}</Button>
                        </Paper>
                    }
                />
            </Pager>
        </Card>
    );
}