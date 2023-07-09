<script>
    export let Text = ""
    export let TabIndex = 0
</script>

<button class="button" tabindex={TabIndex}>
    {#if Text != ""}
        {Text}
    {:else}
        <slot />
    {/if}
</button>

<style>
    .button {
        all: unset;
        display: inline;
        padding: 4px 8px;
        background-color: var(--surface);
        color: var(--text);
        user-select: none;
        -webkit-user-select: none;
        transition: background-color var(--transition-time) linear;
    }
    .button:hover {
        background-color: var(--surface-hover);
    }
    .button:active, .button:active:focus {
        background-color: var(--accent-pressed);
    }
    .button:focus {
        background-color: var(--accent);
    }
</style>