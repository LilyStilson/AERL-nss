<script>
    import { 
        Center, 
        Label, 
        StackPanel, 
        Button,
        TextBox
    } from "./lib/ui/AErenderLauncherUI";
  import TaskEditor from "./pages/TaskEditor.svelte";
</script>

<main>
    <Center>
        <TaskEditor />
    </Center>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
