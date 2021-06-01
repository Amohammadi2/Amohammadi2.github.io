<script>
    import { onMount } from "svelte";

    import Loader from "./Loader.svelte"
    import PostCard from "../components/cards/PostCard.svelte";
    import CardContainer from "../components/cards/CardContainer.svelte";

    import NotificationAPI from "../modules/notificationAPI";

</script>

<Loader on:loadend={() => NotificationAPI.warning("این قسمت هنوز در حال توسعه است")}/>

<div class="container">
    <CardContainer>
        <span slot="title">پروژه های وب</span>
        <div slot="cards" class="cards-section">
            <PostCard post_img="Django-spa-blog.png"/>
            <PostCard post_img="flashlight.png"/>
        </div>
    </CardContainer>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        width: 70%;
        margin: auto;
    }

    .cards-section {
        display: flex;
        flex-shrink: 0;
        overflow-x: scroll;
        overflow-y: hidden;
        padding: 15px 20px;
    }

    /* width */
    .cards-section::-webkit-scrollbar {
    width: 3px;
    height: 8px;
    }

    /* Track */
    .cards-section::-webkit-scrollbar-track {
    background: #edffed;
    }

    /* Handle */
    .cards-section::-webkit-scrollbar-thumb {
    background: rgb(88, 255, 116);
    transition: all 0.9s ease-in-out;
    }

    /* Handle on hover */
    .cards-section::-webkit-scrollbar-thumb:hover {
    background: rgb(222, 90, 255);
    }

    @media only screen and (max-width: 550px) {
        .container {
            width: 97%; /*better view on small devices*/
        }
    }
</style>