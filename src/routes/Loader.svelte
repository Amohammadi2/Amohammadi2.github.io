<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    export let autoFadeOut = true;
    export let duration = 1000;
    export let loading = true;

    if (autoFadeOut) {
        onMount(() => {
            setTimeout(() => {
                loading = false
            }, duration);
        });
    }
</script>

{#if loading}
    <div class="loader-container" out:fade={{duration: 300}}>
        <svg>
            <circle class="first" cx="53" cy="53" r="50" stroke="rgb(32, 204, 147)" stroke-width="3" fill="none"/>
            <circle class="second" cx="53" cy="53" r="25" stroke="rgb(32, 204, 147)" stroke-width="3" fill="none"/>
        </svg>
        <p>در حال بارگذاری</p>
    </div>
{/if}

<style>
    .loader-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 100vh;
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        background-color: rgb(255, 255, 255);
        z-index: 99999;
    }

    svg {
        width: 110px;
    }

    svg circle.first {
        stroke-dasharray: 400;
        stroke-dashoffset: 250;
        animation: spin 2000ms infinite linear forwards;
        transform-origin: 53px 53px;
    }

    svg circle.second {
        stroke-dasharray: 200;
        transform-origin: 53px 53px;
        animation: spin_2 2000ms infinite linear reverse forwards;
    }

    @keyframes spin {
        from {
            transform: rotateZ(0deg);
            stroke-dashoffset: 750;
        }
        to {
            transform: rotateZ(360deg);
            stroke-dashoffset: 100;
        }
    }

    @keyframes spin_2 {
        from {
            transform: rotateZ(0deg);
            stroke-dashoffset: 325;
        }
        to {
            transform: rotateZ(360deg);
            stroke-dashoffset: 50;
        }
    }
</style>