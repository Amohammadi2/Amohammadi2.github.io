<div class="card-container">
    <div class="title">
        <slot name="title"></slot>
    </div>
    
    <slot name="cards"></slot>
</div>

<style>
    .card-container {
        box-sizing: border-box;
        padding: 10px 25px;
        background-color: white;
        box-shadow: 0px 1px 15px 3px rgb(216, 216, 216);
        margin: 12px 0px;
        border-radius: 18px;
    }

    .card-container .title {
        font-weight: bold;
        font-size: 35px;
        color: rgb(51, 51, 51);
    }
</style>