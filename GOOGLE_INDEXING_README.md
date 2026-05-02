# Google Indexing API Refresh Token Setup

This guide explains how to generate a `GOOGLE_INDEXING_REFRESH_TOKEN` for your NewsEdition project.

## Prerequisites

- You must have Google OAuth credentials set up in your `.env.local` file:
  - `GOOGLE_INDEXING_CLIENT_ID`
  - `GOOGLE_INDEXING_CLIENT_SECRET`
- Access to the Google account `newsedition1@gmail.com` (the service account owner)

## Quick Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install googleapis
   ```

2. **Run the token generation script**:
   ```bash
   npm run get-google-token
   ```

3. **Follow the prompts**:
   - The script will display an authorization URL
   - Click the URL to open it in your browser
   - Sign in with `newsedition1@gmail.com` (if prompted)
   - Grant permission for "Submit URLs to Google" when asked
   - You'll be redirected to `http://localhost:3001` (this is normal)

4. **Copy the refresh token**:
   - The script will print your refresh token to the console
   - Copy the `GOOGLE_INDEXING_REFRESH_TOKEN` value
   - Paste it into your `.env.local` file

## What the Script Does

The `scripts/get-google-refresh-token.ts` script:

1. **Generates OAuth URL**: Creates a Google OAuth authorization URL with the correct scopes
2. **Starts Local Server**: Runs a temporary HTTP server on port 3001 to handle the OAuth callback
3. **Handles Authorization**: Exchanges the authorization code for access and refresh tokens
4. **Outputs Token**: Prints the refresh token that you can copy to your environment file

## Manual Process (Alternative)

If you prefer to do it manually:

1. Go to: https://accounts.google.com/o/oauth2/v2/auth
2. Use these parameters:
   ```
   client_id=YOUR_CLIENT_ID
   redirect_uri=http://localhost:3001/oauth2callback
   scope=https://www.googleapis.com/auth/indexing
   access_type=offline
   response_type=code
   prompt=consent
   ```
3. After authorization, extract the `code` parameter from the redirect URL
4. Exchange the code for tokens using a POST request to `https://oauth2.googleapis.com/token`

## Token Details

- **Refresh Token**: Never expires (unless revoked)
- **Access Token**: Expires after 1 hour, automatically refreshed by the app
- **Scope**: `https://www.googleapis.com/auth/indexing` (submit URLs to Google Search)

## Troubleshooting

- **Port 3001 in use**: Change the redirect URI in the script if needed
- **Permission denied**: Make sure you're using the correct Google account
- **Invalid client**: Verify your OAuth credentials are correct
- **Token expired**: Re-run the script to get a new refresh token

## Security Notes

- Keep your refresh token secure and never commit it to version control
- The token is tied to the specific Google account and OAuth app
- If compromised, revoke it in Google Cloud Console → APIs & Services → Credentials