<script lang="ts">
  import { base, resolve } from "$app/paths";
</script>

<footer>
  <a class="org" href="https://teacher.dev" target="_blank" rel="external noreferrer">
    <img src="{base}/brand/teacher-dev-logo.svg" alt="" width="22" height="22" />
    <span>Built at the EdTech-a-thon by teacher.dev</span>
  </a>

  {#if $$slots.default}
    <div class="page-credits"><slot /></div>
  {/if}

  <nav>
    <a href={resolve("/about")}>About</a>
    <a href={resolve("/privacy")}>Privacy</a>
  </nav>
</footer>

<style>
  footer {
    display: flex;
    gap: 10px 24px;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 22px clamp(22px, 5vw, 78px);
    border-top: 1px solid #c9c2b2;
    color: #737871;
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .org {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  nav {
    display: flex;
    gap: 10px 18px;
    flex-wrap: wrap;
    align-items: center;
  }

  /* The footer's links are credits, not calls to action: they keep the row's
     colour and only pick up an underline. */
  footer a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 2px;
  }

  footer a:hover {
    text-decoration: underline;
  }

  /* Slotted credits belong to the page's own style scope, so they need a global
     rule to pick up the footer's muted link colour. */
  .page-credits :global(a) {
    color: inherit;
    text-underline-offset: 2px;
  }

  @media (max-width: 600px) {
    footer {
      gap: 16px;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* Printing a label should give the label alone, not the site's chrome. */
  @media print {
    footer {
      display: none;
    }
  }
</style>
