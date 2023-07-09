<script>
    import { Label, StackPanel, TextBox, Panel } from "../lib/ui/AErenderLauncherUI"

    let ActivePage = 0;
</script>

<div class="task-editor">
    <div class="editor-page" id="project">
        <!-- Titlebar -->
        <div style="flex: 0 1;">
            <Panel Style="Toolbar">
                <div class="panel-content">
                    <Label Style="Subtitle" Margin="0 0 0 16px">Project Setup</Label>
                    <StackPanel Orientation="Horizontal">
                        <Label>Project file path:</Label>
                        <TextBox Height="24px" />
                    </StackPanel>
                </div>
            </Panel> 
        </div>

        <!-- Content -->
        <div style="flex: 2 0;">

        </div>

        <!-- Statusbar -->
        <div style="flex: 0 1;">
            <Panel Style="Statusbar">
                <Label Style="Caption" Margin="0 0 0 16px">Statusbar</Label>

            </Panel>
        </div>
    </div>

    <div class="editor-page" id="compositions">

    </div>
</div>

<style>
    .task-editor {
        display: -webkit-box;
        width: 640px;
        height: 384px;
        background-color: var(--surface-front);
        overflow: hidden;
        border: 1px solid var(--border);
        -webkit-box-shadow: 0px 16px 48px 0px rgba(0,0,0,0.5);
        -moz-box-shadow: 0px 16px 48px 0px rgba(0,0,0,0.5);
        box-shadow: 0px 16px 48px 0px rgba(0,0,0,0.5);
    }
    .editor-page {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
    .panel-content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
    }
</style>