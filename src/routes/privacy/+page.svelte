<script lang="ts">
  import SiteHeader from "$lib/SiteHeader.svelte";
  import SiteFooter from "$lib/SiteFooter.svelte";
</script>

<svelte:head>
  <title>Privacy - Label Your Lunch</title>
  <meta
    name="description"
    content="What Label Your Lunch collects, what it does not, and why."
  />
</svelte:head>

<SiteHeader backLabel="Back to the calculator" />

<main>
  <h1>Privacy</h1>
  <p class="lede">What we collect, what we don't, and why.</p>

  <section>
    <p>
      Label Your Lunch does not collect personal information from visitors or
      students. There are no accounts to create and no advertising. We use
      Cloudflare Web Analytics to anonymously count visits, which helps us
      understand how Label Your Lunch is being used in classrooms. Cloudflare
      Web Analytics is cookieless, does not fingerprint visitors, and does not
      track people across other sites; see Cloudflare's
      <a
        href="https://www.cloudflare.com/privacypolicy/"
        target="_blank"
        rel="external noreferrer">privacy policy</a
      > for details. We do not share, sell, or otherwise transfer visitor data to
      anyone else.
    </p>
    <p>
      The meal you are building — the foods you picked, how much of each, the
      meal's name, and the age band you chose — is saved in your browser's local
      storage so a refresh doesn't lose your work. That information stays on
      your device and is never sent to us. Clearing your browser's site data
      removes it.
    </p>
    <p>
      Questions or concerns? Email
      <a href="mailto:support@teacher.dev?subject=Label%20Your%20Lunch%20privacy"
        >support@teacher.dev</a
      >.
    </p>
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
    padding: 24px clamp(18px, 4vw, 28px);
    border: 1px solid #bdb5a5;
    background: #faf8f1;
    box-shadow: 8px 8px 0 #d9d2c2;
  }

  section p {
    margin: 0 0 14px;
    color: #4a534e;
    font-size: 15px;
    line-height: 1.65;
  }

  section p:last-child {
    margin-bottom: 0;
  }

  a {
    color: #b93c1c;
  }
</style>
