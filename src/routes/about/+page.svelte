<script lang="ts">
  import { base } from "$app/paths";
  import SiteHeader from "$lib/SiteHeader.svelte";
  import SiteFooter from "$lib/SiteFooter.svelte";
</script>

<svelte:head>
  <title>About - Label Your Lunch</title>
  <meta
    name="description"
    content="Label Your Lunch is a free classroom nutrition tool from teacher.dev, built at the EdTech-a-thon."
  />
</svelte:head>

<SiteHeader backLabel="Back to the calculator" />

<main>
  <h1>About</h1>
  <p class="lede">
    A free nutrition label builder for classrooms: search USDA food data,
    combine ingredients, and read the label a meal would carry.
  </p>

  <section>
    <div class="org">
      <img
        src="{base}/brand/teacher-dev-logo.svg"
        alt=""
        width="44"
        height="44"
      />
      <h2>From teacher.dev</h2>
    </div>
    <p>
      Label Your Lunch was built at the <strong>EdTech-a-thon</strong>, the
      annual event where teachers and developers spend three days building free
      tools for classrooms. The event — and the software that comes out of it —
      is organized by
      <a href="https://teacher.dev" target="_blank" rel="external noreferrer"
        >teacher.dev</a
      >, a community on a mission to solve as many teacher problems as possible.
      See what else we are building at
      <a href="https://teacher.dev" target="_blank" rel="external noreferrer"
        >teacher.dev</a
      >.
    </p>

    <figure>
      <img
        src="{base}/brand/edtechathon-2026-participants.jpg"
        alt="Participants of the 2026 EdTech-a-thon"
      />
      <figcaption>EdTech-a-thon 2026</figcaption>
    </figure>
  </section>

  <section>
    <h2>Our promise</h2>
    <ul>
      <li><strong>Zero paywalls.</strong></li>
      <li><strong>Zero ads.</strong></li>
      <li><strong>Zero tracking of personal data.</strong></li>
    </ul>
  </section>

  <section>
    <h2>Feedback &amp; ideas</h2>
    <p>
      We would love to hear from you. Tell us what is working, what is not, or
      pitch an idea for a tool you wish existed. We are here to help.
    </p>
    <a
      class="email"
      href="mailto:support@teacher.dev?subject=Label%20Your%20Lunch%20feedback"
      >Email support@teacher.dev</a
    >
  </section>
</main>

<SiteFooter />

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #f3efe4;
    color: #17231e;
    font-family: Arial, Helvetica, sans-serif;
  }

  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 46px clamp(22px, 5vw, 40px) 70px;
  }

  h1 {
    margin: 0 0 14px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(30px, 5vw, 40px);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .lede {
    margin: 0 0 36px;
    color: #59635e;
    font-size: 16px;
    line-height: 1.6;
  }

  section {
    margin-bottom: 26px;
    padding: 24px clamp(18px, 4vw, 28px);
    border: 1px solid #bdb5a5;
    background: #faf8f1;
    box-shadow: 8px 8px 0 #d9d2c2;
  }

  h2 {
    margin: 0 0 10px;
    font-size: 18px;
  }

  .org {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .org h2 {
    margin: 0;
  }

  p,
  li {
    color: #4a534e;
    font-size: 15px;
    line-height: 1.65;
  }

  section p {
    margin: 0 0 12px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 6px;
  }

  a {
    color: #b93c1c;
  }

  /* The photo is pinned up like a print, slightly off square. */
  figure {
    max-width: 480px;
    margin: 26px auto 6px;
    padding: 10px 10px 4px;
    background: white;
    border: 1px solid #ddd6c6;
    box-shadow: 6px 7px 0 #d9d2c2;
    transform: rotate(-1deg);
  }

  figure img {
    display: block;
    width: 100%;
    background: #ece7da;
  }

  figcaption {
    padding: 10px 0 8px;
    color: #6f766f;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-align: center;
    text-transform: uppercase;
  }

  .email {
    display: inline-block;
    margin-top: 4px;
    padding: 10px 16px;
    background: #17231e;
    color: #f7f3e8;
    font-size: 14px;
    text-decoration: none;
  }

  .email:hover {
    background: #2c3b34;
  }
</style>
