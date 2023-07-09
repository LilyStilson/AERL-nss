<script>
    import { Command } from "@tauri-apps/api/shell";
  
    let lines = [];

</script>

<div>
    <h1>Test</h1>
    <button on:click={ async () => {
        const cmd = new Command("start-aerender", ["-h"], {
            env: {
                "PATH": "C:\\Program Files\\Adobe\\Adobe After Effects 2023\\Support Files"
            }
        })
        
        cmd.stdout.on("data", (line) => {
            lines = [...lines, line]
            console.log(line)
        })

        const child = await cmd.spawn()
        console.log(child.pid)

    }}>Click me</button>
    {#each lines as line}
        <p>{line}</p>
    {/each}
</div>

