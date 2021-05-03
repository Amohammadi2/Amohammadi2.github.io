<script>
	import { onMount } from "svelte";
	import anime from "animejs/lib/anime.es";
	import Splide from "@splidejs/splide";
	import IconicButton from "./components/buttons/IconicButton.svelte";
	import SoroushIcon from "./components/icons/SoroushIcon.svelte";
	import RubikaIcon from "./components/icons/RubikaIcon.svelte";
	import VirgoolIcon from "./components/icons/VirgoolIcon.svelte";
	import Biography from "./components/static/Biography.svelte";
	import SkillCard from "./components/cards/SkillCard.svelte";
	import Link from "./components/utils/Link.svelte";

	function playStartAnimation() {
		anime({
			targets: "#s-icon",
			duration: 200,
			translateX: "-=50px",
			easing: "easeInOutSine",
		});
		anime({
			targets: "#r-icon",
			duration: 200,
			translateX: "+=50px",
			easing: "easeInOutSine",
		});
	}

	function InitSliders() {
		new Splide(".splide", {
			type: "slide",
			perPage: 3,
			focus: "center",
			gap: "2rem",
			pagination: false,
			breakpoints: {
				'700': {
					perPage: 1,
				},
			}
		}).mount();
	}

	function displayCards() {
		anime({
			targets: ".skill-card",
			duration: 600,
			opacity: 1,
		})
	}

	window.onscroll = event => {
		if (window.scrollY > 380) displayCards();
	}

	onMount(() => {
		playStartAnimation();
		InitSliders();
	});
</script>

<div class="main-grid">
	<header class="header">
		<div class="user-profile">
			<img src="./img/profile.jpg" alt="prof"/>
		</div>
		<div class="link-list">
			<Link addr="@ashkan_mohammadi" action="copy">
				<span id="s-icon" style="transform: translateX(50px);">
					<SoroushIcon />
				</span>
			</Link>
			<Link addr="https://virgool.io/@mohammadiashkan1384">
				<span id="v-icon">
					<VirgoolIcon />
				</span>
			</Link>
			<Link addr="@m_AshkanProgrammer" action="copy">
				<span id="r-icon" style="transform: translateX(-50px);">
					<RubikaIcon />
				</span>
			</Link>
		</div>
		<h1 class="title">
			اشکان محمدی
		</h1>
		<p class="description">
			توسعه دهنده وب، علاقه مند به هوش مصنوعی و نویسندگی
		</p>
		<div class="btn-group">
			<IconicButton text="مقالات" icon_class="file-text"
				style="background-color: rgba(256, 256, 256, 0.3); color: rgb(32, 204, 147); border: 1px solid rgb(32, 204, 147);"/>
			<IconicButton text="پروژه ها" icon_class="tasks"/>
			<IconicButton text="ارتباط با من" icon_class="phone-square"/>
		</div>
	</header>
	<section class="green-box">
		<div class="container rtl">
			<Biography />
		</div>
	</section>
</div>

<section>
	<h1 align="center">خدماتی که ارائه میدم</h1>
</section>

<div class="splide">
	<div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide">
				<SkillCard vectorImg="Frontend.svg" text="توسعه Front-end" />
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg" text="توسعه Back-end" />
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="SoroushBot.svg" text="ساخت بات سوروش" />
			</li>
		</ul>
	</div>
</div>

<section id="contact-form">
	<h1 align="center">پیشنهاد، انتقاد یا درخواست همکاری داری؟</h1>
	<textarea placeholder="همین جا مطرحش کن..."></textarea>
	<IconicButton text="ارسال" icon_class="send" />
</section>

<footer style="margin-top: 100px; color: transparent">
	footer part
</footer>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
		background: url(../img/background.png);
		background-size: cover;
		background-attachment: fixed;
	}

	:global(.p-icon) {
		cursor: pointer;
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
		grid-template-columns: 1fr;
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

	.user-profile{
		width: 150px;
		height: 150px;
		overflow: hidden;
		border-radius: 50%;
	}

	.user-profile img {
		width: 150px;
		height: 180px;
	}

	.header {
		width: 100%;
		min-height: 100vh;
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
	.header .description {
		direction: rtl;
	}

	.btn-group {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 360px;
	}

	.container {
		width: 60%;
		margin-top: 30px;
		margin-bottom: 30px;
		margin-left: 20%;
		text-align: justify;
	}
	.rtl {
		direction: rtl;
	}
	.green-box {
		background-color:rgb(32, 204, 147);
		color: white;
	}

	.grid {
		display: grid;
	}
	
	.row-3 {
		grid-template-columns: 1fr 1fr 1fr;
	}

	.card-header {
		margin: 0 !important;
	}

	section textarea {
		width: 100%;
		min-height: 200px;
		max-height: 500px;
		direction:rtl;
		border: none;
		outline: none;
		border-right: 2px solid rgb(32, 204, 147);
		border-left: 2px solid rgb(32, 204, 147);
		margin-top: 40px;
		margin-bottom: 10px;
		resize: vertical;
	}

	#contact-form {
		margin-top: 60px;
		width: 60%;
		margin-left: 20%;
		margin-right: 20%;
	}

	@media only screen and (max-width: 750px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
		
		.btn-group {
			flex-direction: column-reverse;
		}

		.container {
			width: 90%;
			margin-left: 5%;
		}

		#contact-form { 
			width: 90%;
			margin-left: 5%;
			margin-right: 5%;
		}
	}
</style>