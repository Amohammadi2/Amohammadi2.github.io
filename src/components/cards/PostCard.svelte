<script>
    import { isProduction } from "../../modules/utils"
    export let post_img;
    const production = isProduction();
</script>

<section class="post" style="
    background: url({production? "/public/img/projects" : "/img/projects/"}{post_img}); 
    background-size: cover;
    background-repeat: no-repeat no-repeat;
">

</section>
<section class="post" style="display: none"></section>

<style>
    :global(body) {
        counter-reset: zindex;
    }

    .post {
        counter-increment: zindex;
        z-index: counter(zindex);
        min-width: 380px;
        min-height: 300px;
        background-color: white;
        border-radius: 23px;
        box-sizing: border-box;
        padding: 10px 20px;
        box-shadow: -5px 2px 15px 1px rgba(0, 0, 0, 0.473);
        margin: 10px 0px 10px -180px;
        transition: all 0.2s ease-out;
    }


    @media (pointer: fine) {
        .post:hover ~ .post {
            margin-left: 5px;
        }
        .post:hover {
            box-shadow: 0px 2px 15px 1px rgb(202, 202, 202);
            transform: rotateZ(-10deg) translateX(-30px);
        }
    }

    .post ~ .post {
        z-index: 3;
    }


    .post:first-child {
        margin-left: 6px;
    }

    .post-img {
        width: 100%;
        border-radius: 23px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .post-img img {
        width: 100%;
        height: 100%;
        border-radius: 23px;
    }

</style>