# Toolhouse JavaScript Client

A lightweight JavaScript client library for interacting with Toolhouse AI agents. Supports both complete response fetching and real-time streaming.

## Installation

```bash
npm install @toolhouseai/client
```

## Quick Start

```javascript
import { Toolhouse } from "@toolhouseai/client";

// Initialize the client with your agent ID
const client = new Toolhouse("your-agent-id");

// Send a message and get the complete response
const response = await client.send("Hello, how can you help me?");
console.log(response);
```

## Usage

### Basic Setup

```javascript
import { Toolhouse } from "@toolhouseai/client";

// Basic initialization
const client = new Toolhouse("your-agent-id");

// With custom configuration
const client = new Toolhouse("your-agent-id", {
  baseUrl: "https://custom-agents.toolhouse.ai",
  env: "production",
  toolhouse_id: "your-toolhouse-id",
  bundle: "your-bundle-name",
});
```

### Sending Messages

#### Complete Response (Promise)

Wait for the complete response before proceeding:

```javascript
const response = await client.send("What is the weather like today?");
console.log(response);
```

#### Streaming Response (Async Iterator)

Process the response as it streams in real-time:

```javascript
for await (const chunk of client.send("Tell me a story")) {
  process.stdout.write(chunk);
}
```

### Managing Conversations

The client automatically manages conversation state using run IDs. Once you send the first message, subsequent messages will continue the same conversation:

```javascript
const client = new Toolhouse("your-agent-id");

// First message starts a new conversation
await client.send("Hello");

// Subsequent messages continue the same conversation
await client.send("Can you help me with JavaScript?");
await client.send("Show me an example");
```

#### Manual Run ID Management

You can also manually manage run IDs for more control:

```javascript
// Get the current run ID
const runId = client.getRunId();

// Set a specific run ID (useful for resuming conversations)
client.setRunId("existing-run-id");

// Continue conversation with the set run ID
await client.send("Continue our previous conversation");
```

### Error Handling

```javascript
try {
  const response = await client.send("Your message");
  console.log(response);
} catch (error) {
  console.error("Error:", error.message);
}
```

For streaming responses:

```javascript
try {
  for await (const chunk of client.send("Your message")) {
    process.stdout.write(chunk);
  }
} catch (error) {
  console.error("Streaming error:", error.message);
}
```

## API Reference

### Constructor

```javascript
new Toolhouse(agentId, config?)
```

**Parameters:**

- `agentId` (string): Your Toolhouse agent ID
- `config` (object, optional): Configuration options
  - `baseUrl` (string): Custom base URL (default: 'https://agents.toolhouse.ai')
  - `env` (string): Environment parameter
  - `toolhouse_id` (string): Your Toolhouse ID
  - `bundle` (string): Bundle name

### Methods

#### `send(message)`

Send a message to the agent.

**Parameters:**

- `message` (string): The message to send

**Returns:**

- Promise that resolves to the complete response string
- Async iterator that yields response chunks when used with `for await`

#### `setRunId(runId)`

Set the run ID for subsequent requests.

**Parameters:**

- `runId` (string): The run ID to use

#### `getRunId()`

Get the current run ID.

**Returns:**

- `string | null`: The current run ID or null if not set

## Examples

### Chat Application

```javascript
import { Toolhouse } from "@toolhouse/client";

const client = new Toolhouse("your-agent-id");

async function chat() {
  // Start conversation
  console.log("Bot:", await client.send("Hello! How can I help you today?"));

  // Continue conversation
  console.log("Bot:", await client.send("I need help with coding"));
  console.log("Bot:", await client.send("Show me a JavaScript example"));
}

chat();
```

### Real-time Streaming

```javascript
import { Toolhouse } from "@toolhouse/client";

const client = new Toolhouse("your-agent-id");

async function streamResponse() {
  console.log("Bot: ");
  for await (const chunk of client.send(
    "Write a short poem about technology"
  )) {
    process.stdout.write(chunk);
  }
  console.log("\n--- End of response ---");
}

streamResponse();
```

### Multiple Conversations

```javascript
import { Toolhouse } from "@toolhouseai/client";

// Separate clients for separate conversations
const conversation1 = new Toolhouse("your-agent-id");
const conversation2 = new Toolhouse("your-agent-id");

// Each maintains its own conversation state
await conversation1.send("Let's talk about JavaScript");
await conversation2.send("Let's talk about Python");

await conversation1.send("Show me an async function");
await conversation2.send("Show me a list comprehension");
```

## Browser Support

This library works in modern browsers that support:

- Fetch API
- Async/await
- Async iterators
- ReadableStream

For older browsers, you may need polyfills.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License. See LICENSE file for details.

## Support

If you have any questions, ask a question to our [Help Agent](https://help.toolhouse.ai) or [come see us on Discord](https://discord.toolhouse.ai).
