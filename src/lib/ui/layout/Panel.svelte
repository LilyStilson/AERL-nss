<script>
    export let Style = "Panel" // Panel, Toolbar, Statusbar
</script>


<div class="panel" data-panel-style={Style}>
    <slot />
</div>

<style>
    .panel {
        display: flex;
        align-items: center;
        background-color: var(--surface-panel);
    }
    .panel[data-panel-style="Toolbar"] {
        height: 32px;
        border-bottom: 1px solid var(--border);
    }
    .panel[data-panel-style="Statusbar"] {
        height: 28px;
        border-top: 1px solid var(--border);
    }
</style>