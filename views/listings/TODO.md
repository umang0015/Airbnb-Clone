# Fix Listing Images Blank Issue

**Status:** In Progress

**Diagnosis:** No code errors found. Upload logic correct (multer → Cloudinary → DB). Blank images due to:
1. Missing public/images/placeholder.jpg → fallback 404.
2. Possible upload fail (check server log).

**Steps:**
- [ ] 1. Create public/images/placeholder.svg
- [ ] 2. Update index.ejs and show.ejs to use .svg
- [ ] 3. Improve controllers/listing.js (delete old images, error handling)
- [ ] 4. Test create/update → check console.log
- [ ] 5. Verify home page images load (Cloudinary URLs)
- [ ] 6. Mark complete
