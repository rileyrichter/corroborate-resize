# corroborate-resize

Using this repo to resize CMS images from Webflow.

Process followed:

- export the content via CSV
- `wget` all the images
- use the `tiny.js` script to resize images (`npm run resize`)
- upload images to GitHub and serve with pages
- find and replace URLs in the CSV
- upload CSV files and update existing items
