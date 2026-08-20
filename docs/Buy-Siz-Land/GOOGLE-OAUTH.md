# Google OAuth for buy.siz.land

Google returns `Error 400: redirect_uri_mismatch` when OAuth is started on `buy.siz.land` unless that host is registered.

## App behaviour (code)

Login on `buy.siz.land` routes **Continue with Google** through `https://siz.land/login?google=1&callbackUrl=…`, so the OAuth `redirect_uri` stays:

`https://siz.land/api/auth/callback/google`

(Session cookies already use `.siz.land`, so the user returns to buy still signed in.)

## Recommended Google Cloud Console entries

Still add these so direct buy-host OAuth also works later:

**Authorized JavaScript origins**

- `https://siz.land`
- `https://www.siz.land`
- `https://buy.siz.land`
- `http://localhost:3000`

**Authorized redirect URIs**

- `https://siz.land/api/auth/callback/google`
- `https://www.siz.land/api/auth/callback/google`
- `https://buy.siz.land/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`
