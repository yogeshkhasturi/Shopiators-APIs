# Shopiators Public API Discoverability Checklist

When adding a new public API endpoint, resource, or version, you MUST run through this checklist to ensure that our API discovery layers (OpenAPI, AI-readable files, SEO) stay synchronized with the actual implementation.

[ ] Add the endpoint to the canonical OpenAPI specification.
[ ] Add accurate summary and description.
[ ] Add request schemas.
[ ] Add response schemas.
[ ] Add authentication/security definitions.
[ ] Add error responses.
[ ] Add examples where useful.
[ ] Confirm the endpoint is correctly categorized/tagged.
[ ] Update API version information if applicable.
[ ] Confirm the canonical OpenAPI JSON exposes the new endpoint.
[ ] Verify `/llms-full.txt` reflects the new endpoint (this happens automatically if generated from OpenAPI).
[ ] Verify `/llms.txt` if the new API introduces a NEW capability/resource that should be mentioned at the high-level.
[ ] Update `sitemap.xml` only if a NEW public documentation/reference URL was created.
[ ] Verify `robots.txt` still allows crawling of the relevant public documentation.
[ ] Add/update public developer documentation on docs.shopiators.com where appropriate.
[ ] Add migration/import/export information if the new endpoint enables a new migration capability.
[ ] Add examples for cURL/JavaScript/PHP/Python where appropriate.
[ ] Run automated tests against the OpenAPI specification.
[ ] Run automated validation of `llms.txt`.
[ ] Run automated validation of `llms-full.txt`.
[ ] Verify all URLs return HTTP 200 where expected.
[ ] Verify no private/authenticated data is exposed.
[ ] Verify the new API is discoverable from the API root or public documentation.
[ ] Update changelog/release notes if the project has an API changelog.
