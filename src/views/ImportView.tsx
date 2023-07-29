import React from "react"
import { IAfterEffectsProject, RenderTask } from "../classes/Rendering"
import ContentProvider from "../components/ContentProvider/ContentProvider"
import { Card, Paper, Title, TextInput, Button, Text, Divider } from "@mantine/core"
import SplitView from "../components/SplitView/SplitView"


interface IImportViewProps {
    path: string
    project: IAfterEffectsProject[]
    callback?: (Task?: RenderTask) => void
}

export default function ImportView(props: IImportViewProps): React.JSX.Element {
    console.log(props.project)
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
                                <Card shadow="sm" style={{ padding: "8px", height: "100%" }}>
                                    <Text size="md">Compositions</Text>
                                    <Divider my="sm" />
                                </Card>
                            }
                            rightPane={
                                <Card shadow="sm" style={{ padding: "8px", height: "100%" }}>
                                    <Text size="md">Composition Properties</Text>
                                    <Divider my="sm" />
                                    <Text size="md">Name: %s</Text>
                                    <Text size="md">Resolution: %s</Text>
                                    <Text size="md">Framerate: %s</Text>
                                    <Text size="md">Start frame: %s</Text>
                                    <Text size="md">End frame: %s</Text>
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
                    </Paper>
                }
            />
        </Card>
    )
}