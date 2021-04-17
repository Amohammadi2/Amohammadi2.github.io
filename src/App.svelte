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
	<header class="header">
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
</div>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
		background: rgb(95,211,212);
background: linear-gradient(132deg, rgba(95,211,212,1) 0%, rgba(37,54,71,1) 100%);
		background-attachment: fixed;
		background-repeat: no-repeat no-repeat;
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
		background-color: rgba(255, 255, 255, 0.342);
	}

	.main-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.posts-container h1 {
		color: white;
		text-align: center;
	}

	.posts-container .card {
		background-color: rgba(255, 255, 255, 0.377);
		box-sizing: border-box;
		padding: 8px 15px;
		width: 80%;
		margin: 20px 10%;
		border-radius: 5px;
		color: white;
		direction: rtl;
		opacity: 0;
	}

	.header {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: rgb(255, 255, 255);
	}
	.header .title {
		font-size: 45px;
		margin-bottom: 5px;
		animation: title_animation 1s infinite;
	}

	.btn-group {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 250px;
	}

	@keyframes title_animation {
		50% {
			text-shadow: 0px 0px 20px rgb(255, 255, 255);
		}
		100% {
			text-shadow: 0px 0px 0px rgb(255, 255, 255);
		}
	}

	@media only screen and (max-width: 750px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
	}
</style>