<script>
    import { 
        Center, 
        Label, 
        StackPanel, 
        Button,
        TextBox
    } from "./lib/ui/AErenderLauncherUI";
</script>

<main>
    <Center>
        <StackPanel Orientation="Vertical" Spacing="8px">
            <Label>This is default font size</Label>
            <Button>Click me</Button>
            <StackPanel Orientation="Horizontal" Spacing="4px">
                <TextBox Hint="Type something here" />
                <TextBox Text="Predefined text" Height="24px" />
                <TextBox Text="Predefined multiline text" Multiline={true} Height="auto" />
            </StackPanel>
        </StackPanel>
    </Center>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
