<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { pop } from "svelte-spa-router";
    import GenericIcon from "../components/icons/GenericIcon.svelte";
    import Loader from "./Loader.svelte";
    import Link from "../components/utils/Link.svelte";
    import IconicButton from "../components/buttons/IconicButton.svelte";
    

    let loading = true;

    onMount(() => {
        setTimeout(() => {loading = false}, 1000);
    })
</script>

{#if loading}
    <div out:fade={{duration: 200}}>
        <Loader/>
    </div>
{/if}

<header>
    <h1>ارتباط با من</h1>
</header>

<main>
    <div>
        شما می توانید از طریق راه های ارتباطی زیر با من در ارتباط باشید
    </div>
    <div class="icon-group">
        <div class="icon-container">
            <Link action="copy" addr="0922721591">
                <GenericIcon icon="Phone" text="09227215691" />
            </Link>
        </div>
        <div class="icon-container">
            <Link action="copy" addr="mohammadiashkan1384@gmail.com">
                <GenericIcon icon="Email" text="mohammadiashkan1384" />
            </Link>
        </div>
    </div>
    <div class="footer">
        <IconicButton text="برگشت" icon_class="arrow-circle-left" on:click={() => pop()}/>
    </div>
</main>

<style>
    * {
        direction: rtl;
    }

    header { 
        background-color: rgb(32, 204, 147);
        width: 100%;
        height: 200px;
        color: white;
        box-sizing: border-box;
        padding: 10px 30px;
    }

    h1 { 
        margin: 0;
    }

    main { 
        width: 60%;
        margin: auto;
        background-color: white;
        transform: translateY(-80px);
        min-height: 300px;
        box-sizing: border-box;
        padding: 20px 30px;
        box-shadow: 0px 1px 20px 1px rgb(238, 238, 238);
        border-radius: 15px;
    }

    .icon-group {
        margin-top: 60px;
        direction: ltr;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .footer {
        direction: ltr;
        margin-top: 60px;
    }

    @media only screen and (max-width: 650px) {
        .icon-group {
            flex-direction: column;
        }
        .icon-container {
            margin-top: 25px;
            margin-bottom: 25px;
        }
        main {
            width: 85%;
        }
    }
</style>