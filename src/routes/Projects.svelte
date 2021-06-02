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
        <span slot="title" dir="rtl"> پروژه های وب</span>
        <div slot="cards" class="cards-section">
            <PostCard post_img="Django-spa-blog.png" post_title="Django spa blog">
                <div id="2606426177"><script type="text/JavaScript" src="https://www.aparat.com/embed/DEtbP?data[rnddiv]=2606426177&data[responsive]=yes&data[title]=%D9%88%D8%A8%D9%84%D8%A7%DA%AF%DB%8C%20%DA%A9%D9%87%20%D8%A8%D8%A7%20django%20%D9%88%20%D8%AA%DA%A9%D9%86%DB%8C%DA%A9%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D9%87%20%D9%86%D9%88%DB%8C%D8%B3%DB%8C%20%D8%AA%DA%A9%20%D8%B5%D9%81%D8%AD%D9%87%20%D8%A7%DB%8C%20%D8%B3%D8%A7%D8%AE%D8%AA%D9%85&&recom=none"></script></div>
            </PostCard>
            <PostCard post_img="flashlight.png" post_title="flashlight 2D JS">
                no video yet
            </PostCard>
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