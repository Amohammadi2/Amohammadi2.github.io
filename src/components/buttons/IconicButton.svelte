<script>
    import { onMount } from "svelte";
    export let icon_class;
    export let text;
    export let style;
    export let pulse = false;

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

<button class="iconic-btn {pulse && 'pulse'}" style={style} bind:this={button} on:click>
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
    .iconic-btn.pulse {
        animation: pulse 0.25s linear;
        animation-iteration-count: 15;
    }

    .btn-icon {
        font-size: 30px;
        margin-right: 8px;
    }

    @keyframes pulse {
        to {
            outline: 3px solid orange;
            outline-offset: 8px;
        }
    }

    @media only screen and (max-width: 750px) {
        .iconic-btn {
			padding-top: 10px;
			padding-bottom: 10px;
            margin-top: 10px;
        }
    }
</style>