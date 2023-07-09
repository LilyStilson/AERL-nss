<script>
    export let Text = ""
    export let Margin = ""
    export let Style = "Body"    // Title, Subtitle, Body, Caption, Link

    let AdjustedStyle = `margin: ${Margin};`
</script>

<div class="label" data-label-style={Style} style={AdjustedStyle}>
    {#if Text != ""}
        {Text}
    {:else}
        <slot />
    {/if}
</div>

<style>
    .label {
        display: inline;
        color: var(--text);
        text-align: center;
        vertical-align: middle;
        user-select: none;
        -webkit-user-select: none;
        transition: color var(--transition-time) linear;
    }
    .label[data-label-style="Body"] {
        font-size: 12px;
    }
    .label[data-label-style="Title"] {
        font-size: 20px;
        font-weight: bold;
    }
    .label[data-label-style="Subtitle"] {
        font-size: 16px;
        font-weight: bold;
    }
    .label[data-label-style="Caption"] {
        font-size: 10px;
    }
    .label[data-label-style="Link"] {
        font-size: 12px;
        color: var(--accent);
        text-decoration: underline;
        cursor: pointer;
    }
    .label[data-label-style="Link"]:hover {
        color: var(--accent-hover);
    }
    .label[data-label-style="Link"]:active {
        color: var(--accent-pressed);
    }

</style>