<script>
    export let Text = ""
</script>

<div class="label">
    {#if Text != ""}
        {Text}
    {:else}
        <slot />
    {/if}
</div>

<style>
    .label {
        display: inline;
        font-size: var(--font-size);
        color: var(--text);
        user-select: none;
        -webkit-user-select: none;
    }
</style>