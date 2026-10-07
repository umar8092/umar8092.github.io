// Generates /projects/index.html, /projects/<id>/index.html, sitemap.xml and llms.txt from PROJECTS in index.html.
// Run after editing PROJECTS: node build-case-studies.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://umar8092.github.io";
const html = readFileSync("index.html", "utf8");
const src = html.slice(html.indexOf("const PROJECTS = ["), html.indexOf("];", html.indexOf("const PROJECTS = [")) + 2);
const PROJECTS = new Function(src + "; return PROJECTS;")();
const today = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PLAT = { squig: "Squig", integry: "Integry", zapier: "Zapier", make: "Make", n8n: "n8n" };
const builtOn = p => (p.on || [p.where.split(" · ")[0].toLowerCase()]).map(k => PLAT[k]).filter(Boolean).join(", ");
const steps = p => p.tracks
  ? p.tracks.map(t => `<h3>${esc(t.name)}</h3><ol>${t.steps.map(([a, b]) => `<li><strong>${esc(a)}</strong>${b ? `: ${esc(b)}` : ""}</li>`).join("")}</ol>`).join("")
  : `<ol>${p.flow.map(s => `<li>${s.label ? `<strong>${esc(s.label)}</strong>: ` : ""}${s.nodes.map(([a, b]) => esc(a) + (b ? ` (${esc(b)})` : "")).join(", ")}</li>`).join("")}</ol>`;

function page(p, i) {
  const url = `${SITE}/projects/${p.id}/`;
  const title = `${p.title}: case study · Muhammad Umar`;
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.summary, url,
      image: `${SITE}/og-image.png`, dateModified: today,
      author: { "@type": "Person", name: "Muhammad Umar", url: `${SITE}/` }, keywords: p.tags.join(", ") },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Muhammad Umar", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Case studies", item: `${SITE}/projects/` },
      { "@type": "ListItem", position: 3, name: p.title, item: url }] }
  ];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.summary)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(p.card)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
@font-face{font-family:"Bricolage Grotesque";font-weight:700;font-display:swap;src:url(/assets/fonts/f-4efd1a5a.woff2) format("woff2")}
@font-face{font-family:"Instrument Sans";font-weight:400 600;font-display:swap;src:url(/assets/fonts/f-e190a634.woff2) format("woff2")}
:root{--paper:#141417;--card:#212126;--ink:#E8E8EC;--muted:#9D9DA8;--line:#2F2F36;--accent:#A78BFA;--accent-ink:#17121F;--link:#B4A0FB;color-scheme:dark}
@media (prefers-color-scheme:light){:root{--paper:#E4E4E7;--card:#EEEEF1;--ink:#18181B;--muted:#52525B;--line:#C5C5CD;--accent:#6D4AD8;--accent-ink:#FFF;--link:#5B3BC4;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:1.0625rem/1.65 "Instrument Sans","Segoe UI",system-ui,sans-serif}
main{width:min(760px,100% - 2.5rem);margin:0 auto;padding:2.5rem 0 4rem}
a{color:var(--link)}
h1,h2,h3{font-family:"Bricolage Grotesque","Segoe UI",system-ui,sans-serif;letter-spacing:-.02em;line-height:1.15}
h1{font-size:clamp(2rem,6vw,3rem);margin:.3rem 0 1rem}
h2{font-size:1.4rem;margin:2.2rem 0 .6rem}
h3{font-size:1.1rem;margin:1.4rem 0 .4rem}
.crumb{font-size:.92rem;color:var(--muted)}
.where{color:var(--muted);margin:1.5rem 0 0}
.lead{font-size:1.2rem}
.outcome{border-left:3px solid var(--accent);padding:.2rem 0 .2rem 1rem;font-weight:600}
ol,ul{padding-left:1.3rem}li{margin:.35rem 0}
.tags{display:flex;flex-wrap:wrap;gap:.5rem;padding:0;list-style:none}
.tags li{margin:0;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:.2rem .75rem;font-size:.9rem}
.cta{margin-top:3rem;padding:1.5rem;background:var(--card);border:1px solid var(--line);border-radius:16px}
.btn{display:inline-block;margin-top:.5rem;padding:.65rem 1.2rem;border-radius:10px;background:var(--accent);color:var(--accent-ink);text-decoration:none;font-weight:600}
</style>
</head>
<body>
<main>
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Muhammad Umar</a> / <a href="/projects/">Case studies</a></nav>
<p class="where">${esc(p.where)} · Built on ${esc(builtOn(p))}</p>
<h1>${esc(p.title)}</h1>
<p class="lead">${esc(p.summary)}</p>
${p.outcome ? `<p class="outcome">${esc(p.outcome)}</p>` : ""}
<h2>How it works</h2>
${steps(p)}
${p.objects ? `<p>Records kept in sync: ${p.objects.map(esc).join(", ")}.</p>` : ""}
<h2>What I built</h2>
<ul>${p.built.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
<h2>Stack</h2>
<ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
<div class="cta">
<h2 style="margin-top:0">Need something like this?</h2>
<p>I'm Muhammad Umar, a senior integration and AI automation engineer with 300+ integrations shipped. Tell me what you want to connect or automate.</p>
<a class="btn" href="/#book">Book a 15-minute call</a>
</div>
<p style="margin-top:2rem">Next case study: <a href="/projects/${next.id}/">${esc(next.title)}</a></p>
</main>
</body>
</html>
`;
}

PROJECTS.forEach((p, i) => {
  mkdirSync(`projects/${p.id}`, { recursive: true });
  writeFileSync(`projects/${p.id}/index.html`, page(p, i));
});


const GROUPS = [["agents", "AI agents"], ["integrations", "Integrations and automation"]];
writeFileSync("projects/index.html", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Case studies · Muhammad Umar</title>
<meta name="description" content="Ten production AI-agent and integration case studies by Muhammad Umar: accounting sync, lead-discovery agents, app verification and more.">
<link rel="canonical" href="${SITE}/projects/">
<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/projects/">
<meta property="og:title" content="Case studies · Muhammad Umar">
<meta property="og:description" content="Production AI-agent and integration case studies.">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Case studies", url: `${SITE}/projects/`, author: { "@type": "Person", name: "Muhammad Umar", url: `${SITE}/` }, hasPart: PROJECTS.map(p => ({ "@type": "Article", headline: p.title, url: `${SITE}/projects/${p.id}/` })) })}</script>
<style>
@font-face{font-family:"Bricolage Grotesque";font-weight:700;font-display:swap;src:url(/assets/fonts/f-4efd1a5a.woff2) format("woff2")}
@font-face{font-family:"Instrument Sans";font-weight:400 600;font-display:swap;src:url(/assets/fonts/f-e190a634.woff2) format("woff2")}
:root{--paper:#141417;--card:#212126;--ink:#E8E8EC;--muted:#9D9DA8;--line:#2F2F36;--link:#B4A0FB;color-scheme:dark}
@media (prefers-color-scheme:light){:root{--paper:#E4E4E7;--card:#EEEEF1;--ink:#18181B;--muted:#52525B;--line:#C5C5CD;--link:#5B3BC4;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:1.0625rem/1.65 "Instrument Sans","Segoe UI",system-ui,sans-serif}
main{width:min(900px,100% - 2.5rem);margin:0 auto;padding:2.5rem 0 4rem}
a{color:var(--link)}
h1,h2{font-family:"Bricolage Grotesque","Segoe UI",system-ui,sans-serif;letter-spacing:-.02em;line-height:1.15}
h1{font-size:clamp(2rem,6vw,3rem);margin:.3rem 0 .5rem}
h2{font-size:1.4rem;margin:2.2rem 0 1rem}
.crumb{font-size:.92rem;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
.grid a{display:block;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.2rem;text-decoration:none;color:var(--ink)}
.grid a:hover{border-color:var(--link)}
.grid strong{display:block;font-family:"Bricolage Grotesque","Segoe UI",system-ui,sans-serif;font-size:1.1rem;margin-bottom:.3rem}
.grid span{color:var(--muted);font-size:.95rem}
</style>
</head>
<body>
<main>
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Muhammad Umar</a> / Case studies</nav>
<h1>Case studies</h1>
<p>Production AI agents and integrations I have built. Each page shows how it works and what I delivered.</p>
${GROUPS.map(([g, label]) => `<h2>${label}</h2><div class="grid">${PROJECTS.filter(p => p.group === g).map(p => `<a href="/projects/${p.id}/"><strong>${esc(p.title)}</strong><span>${esc(p.card)}</span></a>`).join("")}</div>`).join("\n")}
</main>
</body>
</html>
`);

const urls = [`${SITE}/`, `${SITE}/projects/`, ...PROJECTS.map(p => `${SITE}/projects/${p.id}/`)];
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);

writeFileSync("llms.txt", `# Muhammad Umar: Senior Integration & AI Automation Engineer

> Muhammad Umar builds production systems that connect APIs, automate business workflows and give AI agents the tools to act. 300+ integrations shipped and maintained across CRM, accounting and marketing platforms (500+ APIs explored), plus production AI agents for lead discovery, research, qualification and outreach.

- Site: ${SITE}/
- LinkedIn: https://www.linkedin.com/in/umar8092
- GitHub: https://github.com/umar8092
- Case studies: ${SITE}/projects/
- Book a call: ${SITE}/#book
- Email: umar8092@gmail.com

## Experience

- AI Automation Engineer (Jan 2026 – Jul 2026): production AI-agent workflows for B2B SaaS customers, orchestrating data, search, CRM and outreach tools.
- Senior Integration & Solution Engineer (Oct 2021 – Jul 2026): 500+ apps across discovery and delivery, 300+ shipped and maintained live. REST, GraphQL, webhooks, polling, scheduled triggers, OAuth 2.0, JWT and Basic Auth.
- Bachelor of Information Technology, Bahria University (2021).

## Platforms

Zapier, n8n, Make, Integry, Squig, GoHighLevel. CRMs include Salesforce, HubSpot, Dynamics 365, Pipedrive, Zoho CRM, Close, Keap, Apollo, Clay and Gong; accounting includes Xero, MYOB and QuickBooks.

## Case studies

${PROJECTS.map(p => `- [${p.title}](${SITE}/projects/${p.id}/): ${p.card}`).join("\n")}
`);

console.log(`wrote ${PROJECTS.length} case studies, sitemap.xml, llms.txt`);
