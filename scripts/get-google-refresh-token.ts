import { createServer } from 'http'
import { parse } from 'url'
import { google } from 'googleapis'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const clientId = process.env.GOOGLE_INDEXING_CLIENT_ID
const clientSecret = process.env.GOOGLE_INDEXING_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_INDEXING_CLIENT_ID or GOOGLE_INDEXING_CLIENT_SECRET')
  process.exit(1)
}

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  'http://localhost:3001/oauth2callback' // Redirect URI for this script
)

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // This requests a refresh token
  scope: ['https://www.googleapis.com/auth/indexing'], // Google Indexing API scope
  prompt: 'consent' // Force consent screen to get refresh token
})

console.log('🔗 Open this URL in your browser:')
console.log(authUrl)
console.log('\n📋 After authorizing, you\'ll be redirected to localhost:3001')
console.log('   Copy the "code" parameter from the URL and paste it here.\n')

// Create a simple HTTP server to handle the OAuth callback
const server = createServer(async (req, res) => {
  const url = parse(req.url!, true)

  if (url.pathname === '/oauth2callback') {
    const code = url.query.code as string

    if (code) {
      try {
        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        console.log('\n✅ Success! Your refresh token is:')
        console.log(tokens.refresh_token!)
        console.log('\n📝 Add this to your .env.local file:')
        console.log(`GOOGLE_INDEXING_REFRESH_TOKEN=${tokens.refresh_token}`)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`
          <h1>Success!</h1>
          <p>Your refresh token has been generated. Check the console for the token.</p>
          <p>You can close this window now.</p>
        `)

        server.close()
        process.exit(0)
      } catch (error) {
        console.error('❌ Error exchanging code for token:', error)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Error exchanging code for token')
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('No authorization code received')
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
})

server.listen(3001, () => {
  console.log('🚀 OAuth callback server running on http://localhost:3001')
  console.log('   Waiting for authorization...\n')
})