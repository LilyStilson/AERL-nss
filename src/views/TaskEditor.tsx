import { OutputModule, RenderSettings, RenderTask } from "../classes/Rendering"
import { useState, useEffect } from "react"
import { Button, Card, Paper, Select, TextInput, Title, Grid, Stack, Checkbox, Text, Divider } from "@mantine/core"
import ContentProvider from "../components/ContentProvider/ContentProvider";
import { save } from "@tauri-apps/api/dialog"


interface ITaskEditorProps {
    Task: RenderTask;
    Callback?: (Task: RenderTask, Changed: boolean) => void;
}

export default function TaskEditor(props: ITaskEditorProps) {
    let [task, setTask] = useState(props.Task)

    useEffect(() => {
        console.log(task)
    }, [task])

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

    return (
        <Card style={{ display: "flex", width: "640px", height: "420px", padding: "8px", boxShadow: "0px 8px 48px 0px rgba(0,0,0,0.5)" }}>
            <ContentProvider style={{ width: "100%"}} 
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

                        <Card style={{ padding: "8px", height: "auto" }}>
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
                    </Paper>
                }
                Footer={
                    <Paper shadow="sm" style={{ display: "flex", justifyContent: "space-between", padding: "8px" }}>
                        <Button variant="default" onClick={() => {
                            props.Callback?.call(null, task, false)
                        }}>Cancel</Button>
                        <Button variant="filled" onClick={() => {
                            props.Callback?.call(null, task, true)
                        }}>Compositions setup {">>"}</Button>
                    </Paper>
                }
            />
        </Card>
    );
}