# AI Mock Interview

An AI-powered mock interview platform that helps you practice for your next job interview.

## Features

- AI-powered interview feedback using OpenAI GPT
- Video recording with webcam
- Audio transcription using OpenAI Whisper
- Multiple interview types (Behavioral & Technical)
- Real-time feedback generation

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://framer.com/motion)
- **UI Components**: [HeadlessUI](https://headlessui.com/)
- **Video Processing**: [FFMPEG.WASM](https://ffmpegwasm.netlify.app/)
- **AI**: OpenAI GPT & Whisper

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   APP_OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `APP_OPENAI_API_KEY` - Required for AI feedback generation
- `UPSTASH_REDIS_REST_URL` - Optional, for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Optional, for rate limiting

## How It Works

1. Select interview type (Behavioral or Technical)
2. Choose your interviewer
3. Record your response via webcam
4. Get AI-powered feedback on your performance

## License

MIT License
