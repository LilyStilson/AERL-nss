import { Paper, Title, Button, Card, Text, Modal, Center, Loader, Grid, Overlay, TextInput, Divider } from "@mantine/core"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { SettingsIcon, PlayIcon, QueueIcon, PlusIcon, MinusIcon, } from "../components/Icons/Icons"
import { useDisclosure } from "@mantine/hooks"
import TaskEditor from "./TaskEditor"
import {  IAfterEffectsProject, RenderTask } from "../classes/Rendering"
import { open as openDialog } from "@tauri-apps/api/dialog"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { EditorSender } from "../classes/Helpers/Enums"
import settings from "../classes/Settings"
import ImportView from "./ImportView"
import { invoke } from "@tauri-apps/api"
import { useStopwatch, useTimer } from "react-timer-hook"
import ListView from "../components/ListView/ListView"
import Expander from "../components/Expander/Expander"
import EditIcon from "../components/Icons/EditIcon"
import PathUtils from "../classes/Helpers/Path"

interface IDefaultViewProps {
    callback?: (sender: unknown) => void;
}

export type TMainViewHandle = {
    newTask(): Promise<void>
}

/// Workaround for it to work inside an object
function useDisclosureObject(initialState: boolean, callbacks?: { onOpen?(): void, onClose?(): void}) {
    const [opened, {open, close}] = useDisclosure(initialState, callbacks)
    return {
        opened,
        open,
        close
    }
}

const MainView = forwardRef<TMainViewHandle, IDefaultViewProps>((props, thisRef) => {
    const dialogs = {
        taskEditor: useDisclosureObject(false),
        importProject: useDisclosureObject(false),
    }

    let [editorSender, setEditorSender] = useState<EditorSender>(EditorSender.TaskCreateButton)
    let [TempRenderTask, setTempRenderTask] = useState(new RenderTask(""))
    let [page, setCurrentPage] = useState(0)
    let [renderTasks, setRenderTasks] = useState<RenderTask[]>([])
    let [isWaiting, setIsWaiting] = useState(false)
    let [projectImportState, setProjectImportState] = useState(false)
    let [importTimeElapsed, setImportTimeElapsed] = useState(0)
    let [parsedProject, setParsedProject] = useState<{path: string, project?: IAfterEffectsProject[]}>({ path: "", project: undefined })

    const LoadingProject = <>
        <Title order={4}>Loading project...</Title>
        <Text>This will take some time.</Text>
    </>,
    ParsingProject = <>
        <Title order={4}>Trying to read After Effects project...</Title>
        <Text>Elapsed {importTimeElapsed} seconds of 10.</Text>
    </>

    const sw = useStopwatch()

    useEffect(() => {
        setImportTimeElapsed(sw.totalSeconds)
        if (sw.totalSeconds > 10) {
            console.warn("Project parsing took too long!")
            setIsWaiting(false)
            sw.reset()
            sw.pause()
        }
    }, [sw])

    useEffect(() => {
        console.log(renderTasks)
    }, [renderTasks])

    async function newTask() {
        setProjectImportState(false)
        setIsWaiting(true)
        props.callback?.call(null, true)

        const project = await openDialog({
            multiple: false,
            filters: [
                { name: "Adobe After Effects Project", extensions: ["aep", "aepx"] }
            ]
        })

        if (project !== null && typeof(project) === "string") {
            setProjectImportState(true)
            setImportTimeElapsed(0)
            sw.reset()
            sw.start()

            const parsed = await invoke<string>("parse_aep", { projectPath: project }) 
            const projectData: IAfterEffectsProject[] = JSON.parse(parsed)
            
            settings.Current.LastProjectPath = project
            setParsedProject({ path: project, project: projectData })

            setIsWaiting(false)
            sw.reset()
            sw.pause()

            dialogs.importProject.open()
        } else {
            props.callback?.call(null, false)
        }
    }

    // weird flex, but ok
    useImperativeHandle(thisRef, () => ({
        async newTask() {
            await newTask()
        }
    }))

    return (
        <>
            <ContentProvider
                Header={
                    <Card shadow="sm" style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                        <Title order={4} style={{ fontWeight: "bold", marginLeft: "8px" }}>Tasks</Title>
                        <div style={{ display: "flex", width: "100%", justifyContent: "right", gap: "0 8px" }}>
                            {/* <Button variant={ isWaiting ? "filled" : "default" } size="sm" onClick={() => {
                                setIsWaiting(!isWaiting)
                            }}>Toggle loading overlay</Button>
                            <Button variant="default" size="sm" onClick={ async () => {
                                await settings.init()
                                if (!settings.isLoaded) 
                                    if (!await settings.tryLoad()) 
                                        if (!await settings.tryLoadLegacy())
                                            await settings.reset()
                                console.log(settings)
                            }}>Load settings</Button> */}
                            <Button variant="default" size="sm" leftIcon={<PlusIcon size={16} filled respectsTheme />} onClick={newTask}>New Task</Button>
                            {/* <Button variant="default" size="sm" leftIcon={<MinusIcon size={16} filled respectsTheme />}>Remove Task</Button> */}
                        </div>
                    </Card>
                }
                Content={
                    <Card shadow="sm" style={{ padding: "8px", height: "100%" }}>
                        <ListView items={renderTasks} itemTemplate={(item, index) => 
                                <Expander key={`task-list-item-${index}`} style={{ width: "100%", marginBottom: "8px" }}
                                    title={PathUtils.getFileName(item.Project)} 
                                    subtitle={item.Output === "" ? "Output path not specified!" : ""}
                                    menu={[
                                        <Button variant="default" size="sm" leftIcon={<EditIcon respectsTheme filled size={20}/>} onClick={() => {
                                            setTempRenderTask(item)
                                            setEditorSender(EditorSender.TaskList)
                                            dialogs.taskEditor.open()
                                        }}>Edit</Button>,
                                        <Button variant="default" size="sm" leftIcon={<MinusIcon respectsTheme filled size={20}/>} onClick={() => {
                                            setRenderTasks(renderTasks.filter((_, i) => i !== index))
                                        }}>Remove</Button>
                                ]}>
                                    <div style={{ width: "100%", display: "flex", gap: "8px" }}>
                                        <Text style={{ flexGrow: "1" }}>Composition name</Text>
                                        <Divider orientation="vertical"/>
                                        <Text style={{ width: "72px" }}>Start frame</Text>
                                        <Divider orientation="vertical"/>
                                        <Text style={{ width: "72px" }}>End frame</Text>
                                        <Divider orientation="vertical"/>
                                        <Text style={{ width: "72px" }}>Split</Text>
                                    </div>
                                    <Divider />
                                    {
                                        item.Compositions.map((comp, index) => 
                                            <div key={`task-list-item-${comp.Name}-${index}`} style={{ width: "100%", display: "flex", gap: "8px" }}>
                                                <Text style={{ flexGrow: "1" }}>{comp.Name}</Text>
                                                <Divider orientation="vertical"/>
                                                <Text style={{ width: "72px" }}>{comp.Frames.StartFrame}</Text>
                                                <Divider orientation="vertical"/>
                                                <Text style={{ width: "72px" }}>{comp.Frames.EndFrame}</Text>
                                                <Divider orientation="vertical"/>
                                                <Text style={{ width: "72px" }}>{comp.Split}</Text>
                                            </div>
                                        )
                                    }
                                </Expander>
                        } />
                    </Card>
                }
                Footer={
                    <Card shadow="sm" style={{ display: "flex", justifyContent: "center", padding: "8px", gap: "0 8px" }}>
                        <Button variant="default" style={{ padding: "0", width: "30px", height: "30px"}}><SettingsIcon size={24} filled respectsTheme /></Button>
                        <Button variant="filled" style={{ width: "128px" }} rightIcon={<PlayIcon size={20} filled fillColor="white" />} 
                        disabled={ renderTasks.length == 0 || renderTasks.find((task) => task.Output === "" || task.Compositions.length == 0) != undefined }>Launch</Button>
                        <Button variant="default" style={{ padding: "0", width: "30px", height: "30px"}}><QueueIcon size={24} filled respectsTheme /></Button>
                    </Card>
                }
            />

            {/* Task editor */}
            <Modal.Root opened={dialogs.taskEditor.opened} onClose={dialogs.taskEditor.close} closeOnClickOutside={false} closeOnEscape={false} centered size="auto" 
                transitionProps={{ transition: "slide-up",  duration: 500, timingFunction: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"}}>
                <Modal.Overlay blur={5} opacity={0.25} />
                <Modal.Content style={{ overflowY: "unset" }}>
                    <Modal.Body style={{ padding: "0" }}>
                        <TaskEditor task={TempRenderTask} sender={editorSender} callback={(task) => {
                            if (task != undefined) 
                                // find if the task with same project already exists
                                if (renderTasks.find(t => t.Project === task.Project) !== undefined) {
                                    // if so, replace it
                                    setRenderTasks(renderTasks.map(t => t.Project === task.Project ? task : t))
                                } else
                                    // if not, add it
                                    setRenderTasks([...renderTasks, task])

                            props.callback?.call(null, false)
                            dialogs.taskEditor.close()
                        }} />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>

            { isWaiting && <Overlay>
                <Center style={{ height: "100%" }}>
                    <Card style={{ width: "320px" }}>
                        <Grid columns={6}>
                            <Grid.Col span="content">
                                <Center style={{ height: "100%" }}>
                                    <Loader size="lg" />
                                </Center>
                            </Grid.Col>
                            <Grid.Col span="auto">
                                {
                                    projectImportState ? ParsingProject : LoadingProject
                                }
                            </Grid.Col>
                        </Grid>
                    </Card>
                </Center>
            </Overlay> }

            {/* Import project */}
            <Modal.Root opened={dialogs.importProject.opened} onClose={dialogs.importProject.close} closeOnClickOutside={false} closeOnEscape={false} centered size="auto" 
                transitionProps={{ transition: "slide-up",  duration: 500, timingFunction: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"}}>
                <Modal.Overlay blur={5} opacity={0.25} />
                <Modal.Content style={{ overflowY: "unset" }}>
                    <Modal.Body style={{ padding: "0" }}>
                        <ImportView path={parsedProject.path} project={parsedProject.project!} callback={(task) => {
                            if (task != undefined) 
                                setRenderTasks([...renderTasks, task])
                            
                            props.callback?.call(null, false)
                            dialogs.importProject.close()
                        }} />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>

        </>
    )
})

export default MainView