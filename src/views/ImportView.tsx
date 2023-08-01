import React, { createRef, useImperativeHandle, useRef, useState } from "react"
import { IAfterEffectsProject, RenderTask, Composition, FrameSpan } from "../classes/Rendering"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { Card, Paper, Title, TextInput, Button, Text, Divider, ColorSwatch } from "@mantine/core"
import SplitView from "../components/SplitView/SplitView"
import ListBox, { IListBoxProps, TListBoxSelectionHandle } from "../components/ListBox/ListBox"

interface IImportViewProps {
    path: string
    project: IAfterEffectsProject[]
    callback?: (Task?: RenderTask) => void
}

export default function ImportView(props: IImportViewProps): React.JSX.Element {
    let [textObj, setTextObj] = useState({
        name: "",
        resolution: "",
        framerate: "",
        startFrame: "",
        endFrame: "",
        backgroundColor: ""
    })
    let [checkedComps, setCheckedComps] = useState<IAfterEffectsProject[]>([])
    let listBoxRef = useRef<TListBoxSelectionHandle>(null)

    return (
        <Card className="popup">
            <ContentProvider style={{ width: "100%", padding: "8px" }} 
                Header={
                    <Paper className="paper">
                        <Title order={4} className="title">Import After Effects project</Title>
                        <TextInput value={props.path} style={{ flex: "1 0", marginLeft: "32px" }} readOnly />
                    </Paper>
                }
                Content={
                    <Paper className="content-fixed">
                        <SplitView splitterPos="60%" style={{ height: "100%" }} 
                            leftPane={
                                <Card shadow="sm" style={{ padding: "8px", height: "100%", display: "flex", flexDirection: "column" }}>
                                    <ContentProvider style={{ height: "inherit" }} 
                                        Header={
                                            <div>
                                                <Text size="md">Compositions</Text>
                                                <Divider my="xs" style={{ margin: "8px 0 0 0"}} />
                                            </div>
                                        }
                                        Content={
                                            <ListBox ref={listBoxRef} items={props.project.map((item) => item.name)} checkboxEnabled 
                                                onSelectionChange={(index) => {
                                                    let comp = props.project[index]
                                                    setTextObj({
                                                        name: comp.name,
                                                        resolution: `${comp.footage_dimensions[0]}x${comp.footage_dimensions[1]}`,
                                                        framerate: `${comp.footage_framerate}`,
                                                        startFrame: `${comp.frames[0]}`,
                                                        endFrame: `${comp.frames[1]}`,
                                                        backgroundColor: `rgb(${comp.background_color.join(", ")})`
                                                    })
                                                }}
                                                onCheckedChange={(checked) => {
                                                    setCheckedComps(checked.map((index) => props.project[index]))
                                                }}
                                            />
                                        }
                                        Footer={
                                            <div className="flex-stretch">
                                                <Button variant="default" size="sm" onClick={() => {
                                                    listBoxRef.current?.selectAll()
                                                }}>Select all</Button>
                                                <Button variant="default" size="sm" onClick={() => {
                                                    listBoxRef.current?.deselectAll()
                                                }}>Deselect all</Button>
                                            </div>
                                        }
                                    />
                                </Card>
                            }
                            rightPane={
                                <Card shadow="sm" style={{ padding: "8px", height: "100%" }}>
                                    <Text size="md">Composition Properties</Text>
                                    <Divider my="sm" />
                                    <Text size="md">Name: {textObj.name}</Text>
                                    <Text size="md">Resolution: {textObj.resolution}</Text>
                                    <Text size="md">Framerate: {textObj.framerate}</Text>
                                    <Text size="md">Start frame: {textObj.startFrame}</Text>
                                    <Text size="md">End frame: {textObj.endFrame}</Text>
                                    <div style={{display: "flex", flexDirection: "row", alignItems: "flex-end"}}>
                                        <Text size="md">Background color: </Text>
                                        <div style={{ margin: "0 8px", height: "20px", width: "36px", outline: "black dashed 1px", backgroundColor: textObj.backgroundColor, borderRadius: "4px" }}/>
                                    </div>
                                </Card>
                            }
                        />
                    </Paper>
                }
                Footer={
                    <Paper className="paper">
                        <Button variant="default" onClick={() => {
                            props.callback?.call(null, undefined)
                        }}>Cancel</Button>
                        <Button variant="filled" color="blue" style={{ marginLeft: "8px" }} disabled={checkedComps.length == 0} onClick={() => {
                            let task = new RenderTask(props.path)
                            task.Compositions = checkedComps.map((item) => new Composition(item.name, new FrameSpan(item.frames[0], item.frames[1]), 1))
                            props.callback?.call(null, task)
                        }}>Import</Button>
                    </Paper>
                }
            />
        </Card>
    )
}