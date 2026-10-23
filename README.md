# Yash Anand | Portfolio

A responsive portfolio built with semantic HTML, CSS, and vanilla JavaScript. The portfolio assistant uses a server-side Groq chat-completion endpoint; the browser never receives the API key.

## Run Locally

Requirements: Node.js 20 or newer and npm.

1. Copy `.env.example` to `.env`:

	```powershell
	Copy-Item .env.example .env
	```

2. Create a Groq API key in the [Groq Console](https://console.groq.com/keys), then add it to `.env`:

	```text
	GROQ_API_KEY=your-key-here
	```

	Keep `.env` private. It is ignored by Git. Do not put the key in frontend code or commit it.

3. From the project directory, start the local Vercel development server:

	```powershell
	npm run dev
	```

4. Open `http://localhost:3000` and use **Ask about Yash**. Opening `index.html` directly will not run the API endpoint.

To test the endpoint directly in PowerShell while the server is running:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body '{"message":"What does Yash study?","history":[]}'
```

The serverless endpoint is `api/chat.js`. It uses the Groq chat completions API and the `llama-3.3-70b-versatile` model shown in the official [Groq quickstart](https://console.groq.com/docs/quickstart). The assistant is grounded in the verified details on this portfolio and identifies missing information instead of inferring it.

## Notes

- `npm run dev` runs the Vercel CLI through `npx`; no application runtime dependencies are added.
- Chat history stays in the current browser session and is cleared with **New chat**.
- Live responses require a valid `GROQ_API_KEY` in the local `.env` file.
- Skills, some project technologies, project links, and live demos remain pending where they are not verified.
- `assets/profile-placeholder.svg` is a replaceable illustration, not a photograph.