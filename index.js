export class Toolhouse {
  constructor(agentId, config = { baseUrl: "https://agents.toolhouse.ai" }) {
    this.agentId = agentId;
    this.baseUrl = config.baseUrl;
    this.url = new URL(`${this.baseUrl}/${agentId}`);
    this.runId = null;

    this.agentId = this.agentId.replace(this.baseUrl, "");

    [("env", "toolhouse_id", "bundle")].forEach((key) => {
      if (config.hasOwnProperty(key)) {
        this.url.searchParams.set(key, config[key]);
      }
    });
  }

  /**
   * Set the run ID for subsequent requests
   * @param {string} runId - The run ID to use
   */
  setRunId(runId) {
    this.runId = runId;
  }

  /**
   * Get the current run ID
   * @returns {string|null} - The current run ID
   */
  getRunId() {
    return this.runId;
  }

  /**
   * Send a message to the agent
   * @param {string} message - The message to send
   * @returns {Promise<string> | AsyncIterable<string>} - Complete response or async iterable for streaming
   */
  send(message = "") {
    const requestBody = JSON.stringify({ message });
    const { url, method } = this._getRequestConfig();

    // Return an object that can be used both ways
    const result = {
      // For await usage - returns complete response
      then: (resolve, reject) => {
        this._fetchComplete(requestBody, url, method)
          .then(resolve)
          .catch(reject);
      },

      // For async iteration - yields chunks
      [Symbol.asyncIterator]: () => {
        return this._fetchStream(requestBody, url, method);
      },
    };

    return result;
  }

  /**
   * Get the request configuration (URL and method) based on run ID
   * @private
   */
  _getRequestConfig() {
    if (this.runId) {
      // Subsequent request - use PUT with run ID
      const putUrl = new URL(`${this.baseUrl}/${this.agentId}/${this.runId}`);
      // Copy search params from original URL
      this.url.searchParams.forEach((value, key) => {
        putUrl.searchParams.set(key, value);
      });
      return { url: putUrl.toString(), method: "PUT" };
    } else {
      // Initial request - use POST
      return { url: this.url.toString(), method: "POST" };
    }
  }

  /**
   * Fetch the complete response (wait for all chunks)
   * @private
   */
  async _fetchComplete(requestBody, url, method) {
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Store run ID from response header if present
      const runId = response.headers.get("x-toolhouse-run-id");
      if (runId && !this.runId) {
        this.runId = runId;
      }

      // For non-streaming responses, just return the text
      if (!response.body) {
        return await response.text();
      }

      // Handle streaming response - collect all chunks
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          completeText += chunk;
        }
        return completeText;
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Fetch and stream the response chunk by chunk
   * @private
   */
  async *_fetchStream(requestBody, url, method) {
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Store run ID from response header if present
      const runId = response.headers.get("x-toolhouse-run-id");
      if (runId && !this.runId) {
        this.runId = runId;
      }

      // For non-streaming responses, yield the complete text
      if (!response.body) {
        const text = await response.text();
        yield text;
        return;
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            yield chunk;
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
