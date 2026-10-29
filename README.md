# Ritanshu Singh — portfolio

A static, responsive HTML/CSS/JavaScript portfolio inspired by the clarity and restraint of benscott.dev. The design and original vector preview artwork were created for this site.

## Open / deploy

Open `index.html` in a browser, or upload the **entire folder** to GitHub Pages, Netlify, or another static host. Keep the `assets/projects` images, `styles.css`, `script.js`, and `Ritanshu_Singh_Resume.pdf` alongside the HTML.

## Add the live demo links (important)

Search `index.html` for `data-demo-url=""` and put a complete HTTPS link inside the quotes, for example:

```html
<a class="project-link demo-link" data-demo-url="https://your-demo.example">Live demo <span aria-hidden="true">↗</span></a>
```

`script.js` will automatically enable that demo link and open it in a new tab. **Until a link is supplied, the Live demo control is intentionally disabled.** This avoids misleading visitors with broken buttons.

## Replace project artwork with real project photos

The 5 PNGs in `assets/projects/` are clearly labeled **illustrative concepts** and are not screenshots of the real applications. To use real screenshots, update the corresponding `<img src="assets/projects/...">` in `index.html`, update the alt text, and remove the `ILLUSTRATIVE CONCEPT` caption in that card.

## Add project videos

Project videos can be added as secure external links in the matching card's `.project-actions` group. Use `target="_blank"` with `rel="noopener noreferrer"` for YouTube and other external media links.

## Update your information

- Personal links, intro, and job history: `index.html`
- Colors, spacing, and responsive styles: `styles.css`
- Hero animation and demo-link wiring: `script.js`

This site uses Google Fonts for DM Sans and Space Grotesk. If you need fully offline fonts, use a system font stack or obtain and serve licensed font files.
