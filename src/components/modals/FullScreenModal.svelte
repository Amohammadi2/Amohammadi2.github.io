<script>
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    export let title;
    export let closed;
    export let zIndex = 999;

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("modalclose");
    }
</script>

{#if !closed}
<div
    class="fs-modal-container {!closed && 'visible'}"
    style="z-index: {zIndex}"
    on:click={() => closeModal()}
>
    <section class="fs-modal" on:click|stopPropagation transition:fly={{duration: 300, y: -200}}>
        <header>
            <h1>{title}</h1>
        </header>
        <div class="body">
            <slot></slot>
        </div>
        <footer>
            <button class="cls-btn" on:click={() => closeModal()}>close</button>
        </footer>
    </section>
</div>
{/if}

<style>
    .fs-modal-container {
        position: fixed;
        top: 0; right: 0; left: 0; bottom: 0;
        background-color: rgba(161, 161, 161, 0.493);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
    }
    .fs-modal-container.visible {
        opacity: 1;
        pointer-events: all;
    }

    .fs-modal {
        width: 60%;
        margin: 0 20%;
        display: flex;
        flex-direction: column;
        background-color: white;
        border-radius: 26px;
        box-sizing: border-box;
        padding: 10px 25px;
        min-height: 450px;
        position: relative;
    }

    @media only screen and (max-width: 750px) {
        .fs-modal {
            width: 80%;
            margin: 0 10%;
        }
    }

    @media only screen and (max-width: 350px) {
        .fs-modal {
            width: 100%;
            margin: 0;
        }
    }

    .fs-modal header {
        direction: rtl;
        color: rgb(44, 44, 44);
        font-weight: bold;
    }
    
    .fs-modal footer {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 18px;
        position: absolute;
        background-color: rgb(245, 245, 245);
        bottom: 0;
        left: 0;
        right: 0; 
        border-radius: 23px;
    }

    .fs-modal .body {
        margin-bottom: 60px;
    }

    .fs-modal footer .cls-btn {
        background-color: rgb(253, 63, 63);
        color: white;
        cursor: pointer;
        transition: all .09s ease-out;
        border-radius: 13px;
    }

    .fs-modal footer .cls-btn:hover {
        background-color:rgb(168, 31, 31);
    }
</style>