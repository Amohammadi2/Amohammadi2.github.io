<script>
	import { onMount } from "svelte";
	import anime from "animejs/lib/anime.es";
	import IconicButton from "./components/buttons/IconicButton.svelte";

	function playStartAnimation() {
		anime({
			targets: "header",
			translateY: "-=50px",
			duration: 800,
		});
		anime({
			targets: ".card",
			opacity: 1,
			translateY: "-=50px",
			duration: 800,
			delay: anime.stagger(100),
		});
	}

	onMount(() => {
		playStartAnimation();
	});
</script>

<div class="main-grid">
	<header class="header">
		<div class="user-profile">
			<img src="./img/profile.jpg" alt="prof"/>
		</div>
		<div class="link-list">
			<span class="fa fa-facebook-square"></span>
			<span class="fa fa-whatsapp"></span>
			<span class="fa fa-telegram"></span>
		</div>
		<h1 class="title">
			اشکان محمدی
		</h1>
		<p class="description">
			توسعه دهنده وب و علاقه مند به تکنولوژی
		</p>
		<div class="btn-group">
			<IconicButton text="پروژه ها" icon_class="tasks"/>
			<IconicButton text="ارتباط با من" icon_class="phone-square"/>
		</div>
	</header>
	<div class="posts-container">
		<div>
			<h1>جدید ترین نوشته ها</h1>
		</div>
		<div style="margin-top: 100px;">
			<div class="card">
				<h3>برنامه نویسی</h3>
				<p>
					یکی از مهم ترین مهارت هایی که یک انسان باید داشته
					باشید مهارت برنامه نویسی است چرا که نحوه فکر کردن و
					چاره اندیشی برای مشکلات را به ما یاد می دهد.
					برنامه نویسی یک چیز بسیار فوق العاده است که بلد بودنش حرف ندارد
					هر کسی می تواند یک برنامه نویس شود و لذت دستور دادن به کامپیوتر
					را تجربه کند.
				</p>
			</div>
			<div class="card">
				<h3>برنامه نویسی</h3>
				<p>
					یکی از مهم ترین مهارت هایی که یک انسان باید داشته
					باشید مهارت برنامه نویسی است چرا که نحوه فکر کردن و
					چاره اندیشی برای مشکلات را به ما یاد می دهد.
					برنامه نویسی یک چیز بسیار فوق العاده است که بلد بودنش حرف ندارد
					هر کسی می تواند یک برنامه نویس شود و لذت دستور دادن به کامپیوتر
					را تجربه کند.
				</p>
			</div>
			<div class="card">
				<h3>برنامه نویسی</h3>
				<p>
					یکی از مهم ترین مهارت هایی که یک انسان باید داشته
					باشید مهارت برنامه نویسی است چرا که نحوه فکر کردن و
					چاره اندیشی برای مشکلات را به ما یاد می دهد.
					برنامه نویسی یک چیز بسیار فوق العاده است که بلد بودنش حرف ندارد
					هر کسی می تواند یک برنامه نویس شود و لذت دستور دادن به کامپیوتر
					را تجربه کند.
				</p>
			</div>
			<div class="card">
				<h3>برنامه نویسی</h3>
				<p>
					یکی از مهم ترین مهارت هایی که یک انسان باید داشته
					باشید مهارت برنامه نویسی است چرا که نحوه فکر کردن و
					چاره اندیشی برای مشکلات را به ما یاد می دهد.
					برنامه نویسی یک چیز بسیار فوق العاده است که بلد بودنش حرف ندارد
					هر کسی می تواند یک برنامه نویس شود و لذت دستور دادن به کامپیوتر
					را تجربه کند.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}

	h1 { 
		position: relative;
	}

	h1::after {
		content: "";
		display: block;
		position: absolute;
		bottom: -15px;
		height: 3px;
		margin-left: 50%;
		transform: translateX(-50%);
		width: 50px;
		background-color: rgb(32, 204, 147);
	}

	.main-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.link-list {
		font-size: 32px;
		margin-top: 20px;
		display: flex;
		flex-direction: row;
		justify-content:space-between;
		width: 130px;
		color: rgb(44, 44, 44);
	}

	.link-list * {
		user-select: none;
		cursor: pointer;
	}

	.posts-container h1 {
		color: black;
		text-align: center;
	}

	.posts-container .card {
		background-color: rgb(249, 249, 249);
		box-sizing: border-box;
		padding: 8px 15px;
		width: 80%;
		margin: 20px 10%;
		border-radius: 5px;
		color: black;
		direction: rtl;
		opacity: 0;
	}

	.user-profile{
		width: 150px;
		height: 150px;
		overflow: hidden;
		border-radius: 50%;
	}

	.user-profile img {
		width: 100%;
		height: 100%;
	}

	.header {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: black;
	}
	.header .title {
		font-size: 45px;
		margin-bottom: 5px;
		margin-top: -2px;
	}

	.btn-group {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 250px;
	}

	@media only screen and (max-width: 750px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
	}
</style>