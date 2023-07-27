import { Paper, Title, Button, Card, ActionIcon, Modal } from "@mantine/core"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { SettingsIcon, PlayIcon, QueueIcon, PlusIcon, MinusIcon, } from "../components/Icons/Icons"
import { useDisclosure } from "@mantine/hooks"
import TaskEditor from "./TaskEditor"
import {  RenderTask } from "../classes/Rendering"
import { open as openDialog } from "@tauri-apps/api/dialog"
import { useEffect, useState } from "react"
import { EditorSender } from "../classes/Helpers/Enums"
import settings from "../classes/Settings"

interface IDefaultViewProps {
    callback?: (sender: any) => void;
}

export default function MainView(props: IDefaultViewProps) {
    const [opened, { open, close }] = useDisclosure(false)

    let [editorSender, setEditorSender] = useState<EditorSender>(EditorSender.TaskCreateButton)
    let [TempRenderTask, setTempRenderTask] = useState(new RenderTask(""))
    let [page, setCurrentPage] = useState(0)
    let [renderTasks, setRenderTasks] = useState<RenderTask[]>([])

    useEffect(() => {
        console.log("tasks:", renderTasks)
        console.log("settings:", settings)
    }, [renderTasks, settings])

    return (
        <>
            <ContentProvider
                Header={
                    <Card shadow="sm" style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                        <Title order={4} style={{ fontWeight: "bold", marginLeft: "8px" }}>Tasks</Title>
                        <div style={{ display: "flex", width: "100%", justifyContent: "right", gap: "0 8px" }}>
                            <Button variant="default" size="sm" onClick={async () => {
                                await settings.init()
                                if (!settings.isLoaded) 
                                    if (!await settings.tryLoad()) 
                                        if (!await settings.tryLoadLegacy())
                                            await settings.reset()
                                console.log(settings)
                            }}>Load settings</Button>
                            <Button variant="default" size="sm" leftIcon={<PlusIcon size={16} filled respectsTheme />} onClick={ async () => {
                                let project = await openDialog({
                                    multiple: false,
                                    filters: [
                                        { name: "Adobe After Effects Project", extensions: ["aep", "aepx"] }
                                    ]
                                })

                                // TODO Project parsing

                                if (project !== null && typeof(project) === "string") {
                                    setEditorSender(EditorSender.TaskCreateButton)
                                    setTempRenderTask(new RenderTask(project))
                                    props.callback?.call(null, true)
                                    settings.Current.LastProjectPath = project
                                    open()
                                }
                            }}>New Task</Button>
                            <Button variant="default" size="sm" leftIcon={<MinusIcon size={16} filled respectsTheme />}>Remove Task</Button>
                        </div>
                    </Card>
                }
                Content={
                    <Card shadow="sm" style={{ padding: "8px", height: "100%" }}>
                        <>
                            { 
                                renderTasks.map((task) => (
                                    <Paper key={task.Project} shadow="sm" style={{ padding: "8px", marginBottom: "8px" }}>
                                        <Title order={5} style={{ marginLeft: "8px" }}>{task.Project}</Title>
                                    </Paper>
                                )) 
                            }
                        </>
                    </Card>
                }
                Footer={
                    <Card shadow="sm" style={{ display: "flex", justifyContent: "center", padding: "8px", gap: "0 8px" }}>
                        <Button variant="default" style={{ padding: "0", width: "30px", height: "30px"}}><SettingsIcon size={24} filled respectsTheme /></Button>
                        <Button variant="filled" style={{ width: "128px" }} rightIcon={<PlayIcon size={20} filled fillColor="white" />}>Launch</Button>
                        <Button variant="default" style={{ padding: "0", width: "30px", height: "30px"}}><QueueIcon size={24} filled respectsTheme /></Button>
                    </Card>
                }
            />

            <Modal.Root opened={opened} onClose={close} closeOnClickOutside={false} closeOnEscape={false} centered size="auto" transitionProps={{ transition: "slide-up",  duration: 500, timingFunction: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"}}>
                <Modal.Overlay blur={5} opacity={0.25} />
                <Modal.Content style={{ overflowY: "unset" }}>
                    <Modal.Body style={{ padding: "0" }}>
                        <TaskEditor Task={TempRenderTask} Sender={editorSender} Callback={(task, changed) => {
                            if (task != null && changed) {
                                // setTempRenderTask(task)
                                setRenderTasks([...renderTasks, task])
                            } 
                            props.callback?.call(null, false)
                            close()
                        }} />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    )
}