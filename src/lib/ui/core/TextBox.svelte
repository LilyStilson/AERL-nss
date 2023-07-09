<script>
    export let Height = "18px"

    export let Multiline = false

    export let Text = ""
    export let Hint = ""

    let AdjustedStyle = `height: ${Height}; ${Multiline ? "resize: none;" : ""}`
</script>

{#if Multiline}
    <textarea class="text-box" placeholder={Hint} value={Text} style={AdjustedStyle}></textarea>
{:else}
    <input type="text" class="text-box" placeholder={Hint} value={Text} style={AdjustedStyle}/>
{/if}

<style>
    .text-box {
        display: inline-block;
        font-family: inherit;
        font-size: 13px;
        color: var(--text);
        background-color: var(--surface);
        border: 1px solid;
        border-color: var(--border);
    }
    .text-box:hover {
        border-color: var(--border-hover)
    }
    .text-box:active, .text-box:active:focus {
        border-color: var(--accent)
    }
    .text-box:focus {
        outline: none;
        border-color: var(--accent)
    }
</style>