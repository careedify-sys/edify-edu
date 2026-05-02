const fs = require('fs');
const data = fs.readFileSync('lib/blog.ts', 'utf8');

// Find all slug positions
const slugPositions = [];
const re = /slug:\s*['`]([^'`]+)['`]/g;
let m;
while ((m = re.exec(data)) !== null) {
  slugPositions.push({ slug: m[1], idx: m.index });
}

const entries = [];
for (let i = 0; i < slugPositions.length; i++) {
  const start = slugPositions[i].idx;
  const end = i + 1 < slugPositions.length ? slugPositions[i + 1].idx : start + 50000;
  const block = data.slice(start, Math.min(end, start + 5000)); // limit to 5KB per entry for metadata

  function extract(key) {
    // single quote
    let r = block.match(new RegExp(key + ":\\s*'([^']*)'"));
    if (r) return r[1];
    // backtick (single line)
    r = block.match(new RegExp(key + ':\\s*`([^`]*)`'));
    if (r) return r[1];
    return '';
  }

  const slug = slugPositions[i].slug;
  const title = extract('title');
  const published = extract('publishedAt');
  const targetKW = extract('targetKeyword');
  const category = extract('category');
  const status = extract('status') || 'published';
  const readTime = (block.match(/readTime:\s*(\d+)/) || ['', ''])[1];

  entries.push({ slug, title, published, targetKW, category, readTime, status });
}

// Sort newest first
entries.sort((a, b) => (b.published || '0').localeCompare(a.published || '0'));

// Build markdown
let md = `# EdifyEdu Blog Inventory

Generated: 2026-04-30 | Source: lib/blog.ts

| # | Slug | Title | Published | Target KW | Category | Read | Status |
|---|------|-------|-----------|-----------|----------|------|--------|
`;

entries.forEach((e, i) => {
  const t = (e.title || '-').replace(/\|/g, '/').substring(0, 70);
  const kw = (e.targetKW || '-').substring(0, 35);
  md += `| ${i + 1} | ${e.slug} | ${t} | ${e.published || '-'} | ${kw} | ${e.category || '-'} | ${e.readTime || '-'} | ${e.status} |\n`;
});

// Summary
const published = entries.filter(e => e.status === 'published').length;
const drafts = entries.filter(e => e.status !== 'published').length;
const dates = entries.filter(e => e.published).map(e => e.published).sort();
const categories = {};
entries.forEach(e => { const c = e.category || 'Uncategorized'; categories[c] = (categories[c] || 0) + 1; });

md += `
## Summary

- **Total blogs:** ${entries.length}
- **Published:** ${published}
- **Drafts:** ${drafts}
- **Date range:** ${dates[0] || 'N/A'} to ${dates[dates.length - 1] || 'N/A'}
- **Categories breakdown:**
`;
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  md += `  - ${cat}: ${count}\n`;
});

if (drafts > 0) {
  md += '\n### Draft Posts\n';
  entries.filter(e => e.status !== 'published').forEach(e => {
    md += `- ${e.slug} (status: ${e.status})\n`;
  });
}

fs.writeFileSync('scripts/blog-inventory-2026.md', md, 'utf8');
console.log(md);
