<script>
    export let addr = "";
    export let action = "open";

    let cpy_field;

    function copy() {
        // Todo: implement a notification system
        alert ("ID copied");
        cpy_field.value = addr;
        cpy_field.select();
        console.log(cpy_field);
        document.execCommand("copy");
        cpy_field.style.display = "none";
        cpy_field.style.display = "block";
    }
</script>

<span on:click={() => action == "open" ? window.open(addr, '_blank') : copy()}>
<slot></slot>
</span>

<input type="text" style="position: fixed; opacity: 0; pointer-events: none;" name="hin" bind:this={cpy_field}>