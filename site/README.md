# site/ — the authoring surfaces

Edit `content/` (innards) or `spine.json` (shell data), then from the `laplace` repo run
`python -m laplace.site_backend render` to write the pages, then `python -m laplace.site_backend gates`
as the one pre-push ritual (add `--skip-visual` to skip the Playwright mobile-width check). Deploy is
the author's push — commit and push once `gates` is green.
