# Hometown — Local Marketplace Preview

A clickable mobile preview of a clean white local-goods marketplace.
Bundles all 40,979 US ZIP codes (city + state + lat/lng from GeoNames)
for the location picker.

Open the live URL on your phone (or in a desktop browser, where it
shows inside an iPhone frame) to navigate the four screens:

- **Browse** — search bar, category chips, listing grid
- **Item detail** — photos, price, condition, seller
- **List an item** — full posting form
- **Profile** — your listings + settings

## Backend

This frontend talks to the marketplace backend at
[premvideos01/marketplace-server](https://github.com/premvideos01/marketplace-server).

On first load you'll be asked for your backend URL (e.g.
`https://marketplace.your-domain.com`). It's stored in your browser's
`localStorage` so you only enter it once. After that, sign up — the first
account that signs up with the `ADMIN_EMAIL` (set on the backend) becomes the
admin and gets the **Admin** entry in the Profile screen.
