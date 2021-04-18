<script>
    import { onMount } from "svelte";
    export let icon_class;
    export let text;
    export let style;

    let button;

    function ripple(event) {
        let {offsetX: x, offsetY: y} = event;
        console.log(event);
        let ripple_el = document.createElement("span");
        ripple_el.style.backgroundColor= "rgba(255, 255, 255, 0.37)";
        ripple_el.style.width = "1px";
        ripple_el.style.height = "1px";
        ripple_el.style.position = "absolute";
        ripple_el.style.top = y+"px";
        ripple_el.style.left = x+"px";
        ripple_el.style.animation="ripple_grow 250ms";
        ripple_el.style.backgroundColor = "white";
        ripple_el.style.borderRadius="50%";

        button.appendChild(ripple_el);
        setTimeout(() => {
            ripple_el.remove();
        }, 300);
    }

    onMount(() => {
        button.addEventListener("click", ripple);
    });
</script>

<button class="iconic-btn" style={style} bind:this={button}>
    <span class="fa fa-{icon_class} btn-icon"></span>
    <span class="btn-text">{text}</span>
</button>

<style>
    .iconic-btn {
        display: flex;
        align-items: center;
        flex-direction: row;
        background-color: rgb(32, 204, 147);
        border: 0;
        outline: none;
        color: white;
        cursor: pointer;
        padding: 5px 8px;
        border-radius: 8px;
        transition: all .09s ease-out;
        overflow: hidden;
        position: relative;
    }
    .iconic-btn:hover {
        background-color: rgb(9, 218, 187);
    }
    .iconic-btn * {
        pointer-events: none;
    }
    .btn-icon {
        font-size: 30px;
        margin-right: 8px;
    }
</style>