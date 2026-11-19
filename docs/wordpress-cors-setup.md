# WordPress CORS & Hostinger CDN Setup (`bike.moustachedesign.fyi`)

The Nuxt app uses a same-origin proxy (`/api/wp/...`, gated by
`enableWpApiProxy`) for client-side navigations so production and Cloudflare
preview origins do not require cross-origin REST calls. To lock down
WordPress origin security and prevent Hostinger CDN (`hcdn`) from caching
`/wp-json/acf/v3/options/options` for 7 days, apply the two steps below in
WordPress / Hostinger hPanel.

## 1. Install the WordPress CORS MU-Plugin

Create `wp-content/mu-plugins/bike-challenge-cors.php` on
`bike.moustachedesign.fyi`:

```php
<?php
/**
 * Restrict REST API CORS to Bike Challenge production, PR previews, and localhost.
 */
add_action( 'rest_api_init', function () {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

    add_filter( 'rest_pre_serve_request', function ( $value ) {
        $origin  = get_http_origin();
        $allowed = false;

        if ( $origin ) {
            $allowed = in_array( $origin, [
                'https://thebikechallenge.cc',
                'https://www.thebikechallenge.cc',
            ], true )
            || preg_match( '#^https://bike-challenge-[a-z0-9-]+\.nunziellasalluce\.workers\.dev$#', $origin ) === 1
            || preg_match( '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin ) === 1;
        }

        header( 'Vary: Origin', false );
        header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );

        if ( $allowed ) {
            header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
            header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Content-Type' );
        }

        return $value;
    } );
}, 15 );
```

## 2. Bypass Hostinger CDN / LiteSpeed Cache for `/wp-json`

1. Open Hostinger hPanel -> **Performance** -> **CDN** (and **LiteSpeed
   Cache** if enabled).
2. Add a **Cache Bypass / Do Not Cache URL** rule for `/wp-json*`.
3. Purge the CDN cache once so stale `/acf/v3/options/options` `HIT` entries
   are evicted.

## 3. Verify from Terminal

```sh
# Production origin allowed + no-store
curl -sI -H "Origin: https://thebikechallenge.cc" \
  "https://bike.moustachedesign.fyi/wp-json/acf/v3/options/options"

# Cloudflare preview origin allowed + no-store
curl -sI -H "Origin: https://bike-challenge-bikechallengesite-pr-3-4ulfcuwuohl57dwn.nunziellasalluce.workers.dev" \
  "https://bike.moustachedesign.fyi/wp-json/acf/v3/options/options"

# Untrusted origin receives no Access-Control-Allow-Origin header
curl -sI -H "Origin: https://untrusted.example.com" \
  "https://bike.moustachedesign.fyi/wp-json/acf/v3/options/options"
```
