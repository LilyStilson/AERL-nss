<script>
    export let Orientation;
    export let Spacing = "0px";

    let SpacingStyle = `gap: ${Spacing};`
</script>

<div class="stack-panel" data-orientation={Orientation} style={`${SpacingStyle}`}>
    <slot />
</div>

<style>
    .stack-panel {
        display: flex;
        align-items: center;
    }
    .stack-panel[data-orientation="Vertical"] {
        flex-direction: column;
    }
    .stack-panel[data-orientation="Horizontal"] {
        flex-direction: row;
    }
</style>