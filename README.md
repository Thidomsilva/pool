# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Google Sheets setup (quick)

This project can persist data to a Google Sheets spreadsheet. To enable it locally set these environment variables in a `.env.local` at the project root or export them in your shell before running the dev server:

- `GOOGLE_SHEETS_ID` — the spreadsheet ID (from the URL)
- `GOOGLE_SERVICE_ACCOUNT_KEY_B64` — the service account JSON file, base64-encoded

Steps:

1. Decrypt the bundled encrypted service-account (optional):

	- Export the passphrase used during encryption as `GENLANG_PASSPHRASE` and run the helper:

	  ```bash
	  export GENLANG_PASSPHRASE="your-passphrase"
	  node scripts/decrypt-service-account.js docs/gen-lang-client-0522472579-9a0d87fe673a.json.enc
	  ```

	- The script will print a path to the decrypted JSON file (saved under `.secret-backup/`).

2. Create `GOOGLE_SERVICE_ACCOUNT_KEY_B64` from the JSON (or from your own service account):

	```bash
	cat .secret-backup/gen-lang-client-0522472579-9a0d87fe673a.json | base64 -w0 > service-key.b64
	export GOOGLE_SERVICE_ACCOUNT_KEY_B64=$(cat service-key.b64)
	```

3. Set the spreadsheet ID:

	```bash
	export GOOGLE_SHEETS_ID="1AbCdEfGhIjKlMnOpQrStUvWxYz"
	```

4. Share the spreadsheet with the service account `client_email` (you can get it via the helper API `GET /api/sheets/serviceAccountEmail` once `GOOGLE_SERVICE_ACCOUNT_KEY_B64` is configured).

5. Restart the dev server (`npm run dev`) so Next.js picks up the env variables.

If you prefer not to decrypt the included credential, provide your own Google service account JSON and base64-encode it to `GOOGLE_SERVICE_ACCOUNT_KEY_B64`.
