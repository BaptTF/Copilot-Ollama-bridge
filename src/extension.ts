import * as vscode from 'vscode';
import * as http from 'http';
import * as url from 'url';

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        num_predict?: number;
        top_p?: number;
    };
}

interface OllamaChatRequest {
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    stream?: boolean;
    options?: {
        temperature?: number;
        num_predict?: number;
        top_p?: number;
    };
}

interface OpenAIChatRequest {
    model: string;
    messages: Array<{
        role: string;
        content: string | Array<{ type: string; text: string }>;
    }>;
    tools?: any[];
    stream?: boolean;
    stream_options?: {
        include_usage?: boolean;
    };
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
}

interface OpenAIChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message?: {
            role: string;
            content: string;
        };
        delta?: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

class CopilotOllamaBridge {
    private server: http.Server | null = null;
    private port: number;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.port = vscode.workspace.getConfiguration('copilot-bridge').get('port', 11434);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-bridge.restart';
        this.outputChannel = vscode.window.createOutputChannel('Copilot Bridge');
        this.updateStatusBar('stopped');
    }

    private updateStatusBar(status: 'running' | 'stopped' | 'error') {
        switch (status) {
            case 'running':
                this.statusBarItem.text = `$(play) Copilot Bridge:${this.port}`;
                this.statusBarItem.backgroundColor = undefined;
                this.statusBarItem.tooltip = `Copilot Ollama Bridge running on port ${this.port}`;
                break;
            case 'stopped':
                this.statusBarItem.text = `$(stop) Copilot Bridge`;
                this.statusBarItem.backgroundColor = undefined;
                this.statusBarItem.tooltip = 'Copilot Ollama Bridge stopped';
                break;
            case 'error':
                this.statusBarItem.text = `$(error) Copilot Bridge`;
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.tooltip = 'Copilot Ollama Bridge error';
                break;
        }
        this.statusBarItem.show();
    }

    async start(): Promise<void> {
        if (this.server) {
            vscode.window.showInformationMessage('Copilot Bridge is already running');
            return;
        }

        try {
            this.server = http.createServer((req, res) => this.handleRequest(req, res));
            
            await new Promise<void>((resolve, reject) => {
                this.server!.listen(this.port, (err?: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            this.updateStatusBar('running');
            this.outputChannel.clear();
            this.outputChannel.appendLine('🚀 Copilot Ollama Bridge Started');
            this.outputChannel.appendLine('================================');
            this.outputChannel.appendLine(`📡 Server: http://localhost:${this.port}`);
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('Ollama-compatible endpoints:');
            this.outputChannel.appendLine(`  GET  /api/tags     - List models`);
            this.outputChannel.appendLine(`  POST /api/generate - Generate completion`);
            this.outputChannel.appendLine(`  POST /api/chat     - Chat completion`);
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('OpenAI-compatible endpoints:');
            this.outputChannel.appendLine(`  POST /v1/chat/completions - OpenAI chat completions`);
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('Usage with Cline:');
            this.outputChannel.appendLine(`  Ollama URL: http://localhost:${this.port}`);
            this.outputChannel.appendLine('  Model: copilot:latest');
            this.outputChannel.show();

            vscode.window.showInformationMessage(`Copilot Bridge started on port ${this.port}`);

        } catch (error) {
            this.updateStatusBar('error');
            this.outputChannel.appendLine(`❌ Failed to start: ${error}`);
            vscode.window.showErrorMessage(`Failed to start Copilot Bridge: ${error}`);
        }
    }

    async stop(): Promise<void> {
        if (!this.server) {
            vscode.window.showInformationMessage('Copilot Bridge is not running');
            return;
        }

        await new Promise<void>((resolve) => {
            this.server!.close(() => resolve());
        });

        this.server = null;
        this.updateStatusBar('stopped');
        this.outputChannel.appendLine('🛑 Copilot Bridge stopped');
        vscode.window.showInformationMessage('Copilot Bridge stopped');
    }

    async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }

    private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        this.outputChannel.appendLine(`${req.method} ${pathname}`);

        try {
            switch (pathname) {
                case '/api/tags':
                    await this.handleTags(res);
                    break;
                case '/api/generate':
                    await this.handleGenerate(req, res);
                    break;
                case '/api/chat':
                    await this.handleChat(req, res);
                    break;
                case '/v1/chat/completions':
                    await this.handleOpenAIChat(req, res);
                    break;
                case '/':
                    await this.handleRoot(res);
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error: ${error}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }

    private async handleTags(res: http.ServerResponse): Promise<void> {
        try {
            // Get all available Copilot models
            const copilotModels = await this.getAvailableCopilotModels();
            
            const models: { models: OllamaModel[] } = {
                models: copilotModels.map(model => ({
                    name: `copilot:${model.family}`,
                    size: 1000000000,
                    digest: `sha256:copilot-${model.family}`,
                    modified_at: new Date().toISOString(),
                    details: {
                        format: 'copilot',
                        family: model.family,
                        families: ['github'],
                        parameter_size: 'Unknown',
                        quantization_level: 'None'
                    }
                }))
            };

            // Add a generic 'latest' model that defaults to the first available
            if (copilotModels.length > 0) {
                models.models.unshift({
                    name: 'copilot:latest',
                    size: 1000000000,
                    digest: 'sha256:copilot-latest',
                    modified_at: new Date().toISOString(),
                    details: {
                        format: 'copilot',
                        family: copilotModels[0].family,
                        families: ['github'],
                        parameter_size: 'Unknown',
                        quantization_level: 'None'
                    }
                });
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(models));
            
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error fetching models: ${error}`);
            // Fallback to basic model list
            const fallbackModels: { models: OllamaModel[] } = {
                models: [
                    {
                        name: 'copilot:latest',
                        size: 1000000000,
                        digest: 'sha256:copilot-latest',
                        modified_at: new Date().toISOString(),
                        details: {
                            format: 'copilot',
                            family: 'gpt-4o',
                            families: ['github'],
                            parameter_size: 'Unknown',
                            quantization_level: 'None'
                        }
                    }
                ]
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fallbackModels));
        }
    }

    private async handleGenerate(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        const body = await this.readRequestBody(req);
        const request: OllamaGenerateRequest = JSON.parse(body);

        this.outputChannel.appendLine(`Generate: "${request.prompt.substring(0, 50)}..."`);

        try {
            const response = await this.generateWithCopilot(request.prompt, request.model);
            
            const ollamaResponse = {
                model: request.model,
                created_at: new Date().toISOString(),
                response: response,
                done: true,
                total_duration: 1000000000,
                load_duration: 100000000,
                prompt_eval_count: request.prompt.split(' ').length,
                prompt_eval_duration: 500000000,
                eval_count: response.split(' ').length,
                eval_duration: 500000000
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(ollamaResponse));

        } catch (error) {
            this.outputChannel.appendLine(`❌ Generate error: ${error}`);
            
            const errorResponse = {
                model: request.model,
                created_at: new Date().toISOString(),
                response: `Error: ${error}`,
                done: true
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    }

    private async handleChat(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        const body = await this.readRequestBody(req);
        const request: OllamaChatRequest = JSON.parse(body);

        this.outputChannel.appendLine(`Chat: ${request.messages.length} messages`);

        try {
            const prompt = this.convertChatToPrompt(request.messages);
            const response = await this.generateWithCopilot(prompt, request.model);
            
            const ollamaResponse = {
                model: request.model,
                created_at: new Date().toISOString(),
                message: {
                    role: 'assistant',
                    content: response
                },
                done: true
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(ollamaResponse));

        } catch (error) {
            this.outputChannel.appendLine(`❌ Chat error: ${error}`);
            
            const errorResponse = {
                model: request.model,
                created_at: new Date().toISOString(),
                message: {
                    role: 'assistant',
                    content: `I'm sorry, I encountered an error: ${error}`
                },
                done: true
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    }

    private async handleOpenAIChat(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        const body = await this.readRequestBody(req);
        const request: OpenAIChatRequest = JSON.parse(body);

        this.outputChannel.appendLine(`OpenAI Chat: ${request.messages.length} messages, stream=${request.stream}`);

        try {
            // Convert OpenAI messages to simple prompt format
            const prompt = this.convertOpenAIMessagesToPrompt(request.messages);
            const response = await this.generateWithCopilot(prompt, request.model);
            
            const chatId = `chatcmpl-${Date.now()}`;
            const created = Math.floor(Date.now() / 1000);
            
            if (request.stream) {
                // Handle streaming response
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });

                // Send initial chunk with role
                const initialChunk: OpenAIChatResponse = {
                    id: chatId,
                    object: 'chat.completion.chunk',
                    created: created,
                    model: request.model,
                    choices: [{
                        index: 0,
                        delta: {
                            role: 'assistant'
                        },
                        finish_reason: null
                    }]
                };
                res.write(`data: ${JSON.stringify(initialChunk)}\n\n`);

                // Send content chunks (simulate streaming by splitting response)
                const words = response.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunk: OpenAIChatResponse = {
                        id: chatId,
                        object: 'chat.completion.chunk',
                        created: created,
                        model: request.model,
                        choices: [{
                            index: 0,
                            delta: {
                                content: (i === 0 ? words[i] : ' ' + words[i])
                            },
                            finish_reason: null
                        }]
                    };
                    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                }

                // Send final chunk
                const finalChunk: OpenAIChatResponse = {
                    id: chatId,
                    object: 'chat.completion.chunk',
                    created: created,
                    model: request.model,
                    choices: [{
                        index: 0,
                        delta: {},
                        finish_reason: 'stop'
                    }]
                };
                res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);

                // Send usage info if requested
                if (request.stream_options?.include_usage) {
                    const usageChunk = {
                        id: chatId,
                        object: 'chat.completion.chunk',
                        created: created,
                        model: request.model,
                        choices: [],
                        usage: {
                            prompt_tokens: prompt.split(' ').length,
                            completion_tokens: response.split(' ').length,
                            total_tokens: prompt.split(' ').length + response.split(' ').length
                        }
                    };
                    res.write(`data: ${JSON.stringify(usageChunk)}\n\n`);
                }

                res.write('data: [DONE]\n\n');
                res.end();

            } else {
                // Handle non-streaming response
                const openaiResponse: OpenAIChatResponse = {
                    id: chatId,
                    object: 'chat.completion',
                    created: created,
                    model: request.model,
                    choices: [{
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: response
                        },
                        finish_reason: 'stop'
                    }],
                    usage: {
                        prompt_tokens: prompt.split(' ').length,
                        completion_tokens: response.split(' ').length,
                        total_tokens: prompt.split(' ').length + response.split(' ').length
                    }
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(openaiResponse));
            }

        } catch (error) {
            this.outputChannel.appendLine(`❌ OpenAI Chat error: ${error}`);
            
            const errorResponse = {
                error: {
                    message: `I'm sorry, I encountered an error: ${error}`,
                    type: 'internal_error',
                    code: 'copilot_error'
                }
            };

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    }

    private async handleRoot(res: http.ServerResponse): Promise<void> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Copilot Ollama Bridge</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2.5em; margin-bottom: 10px; }
        pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .status { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🤖➡️🦙</div>
            <h1>Copilot Ollama Bridge</h1>
            <p class="status">✅ Server Running on Port ${this.port}</p>
        </div>
        
        <h2>📡 Ollama-Compatible Endpoints</h2>
        
        <div class="endpoint">
            <h3>GET /api/tags</h3>
            <p>List available models</p>
            <pre>curl http://localhost:${this.port}/api/tags</pre>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/generate</h3>
            <p>Generate text completions</p>
            <pre>curl -X POST http://localhost:${this.port}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"model":"copilot:latest","prompt":"def fibonacci(n):"}'</pre>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/chat</h3>
            <p>Chat-style completions</p>
            <pre>curl -X POST http://localhost:${this.port}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Write a function"}]}'</pre>
        </div>
        
        <h2>🔗 OpenAI-Compatible Endpoints</h2>
        
        <div class="endpoint">
            <h3>POST /v1/chat/completions</h3>
            <p>OpenAI-compatible chat completions with streaming support</p>
            <pre>curl -X POST http://localhost:${this.port}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"test","messages":[{"role":"user","content":"Hello"}],"stream":true}'</pre>
        </div>
        
        <h2>🔧 Usage with Cline</h2>
        <ol>
            <li>Set Ollama URL: <code>http://localhost:${this.port}</code></li>
            <li>Select model: <code>copilot:latest</code></li>
        </ol>
        
        <h2>✅ Features</h2>
        <ul>
            <li>Uses VS Code's official Language Model API</li>
            <li>Automatic Copilot authentication</li>
            <li>100% Ollama-compatible endpoints</li>
            <li>No manual token extraction</li>
        </ul>
    </div>
</body>
</html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    private async getAvailableCopilotModels(): Promise<Array<{ family: string }>> {
        try {
            // Get all available Copilot models
            const allModels = await vscode.lm.selectChatModels({
                vendor: 'copilot'
            });

            // Extract unique families
            const families = [...new Set(allModels.map(model => model.family))];
            return families.map(family => ({ family }));
            
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error getting models: ${error}`);
            // Fallback to known common models
            return [
                { family: 'gpt-4o' },
                { family: 'gpt-4' },
                { family: 'gpt-3.5-turbo' }
            ];
        }
    }

    private async generateWithCopilot(prompt: string, requestedModel?: string): Promise<string> {
        try {
            // Extract family from requested model (e.g., "copilot:gpt-4" -> "gpt-4")
            let targetFamily = 'gpt-4o'; // default
            if (requestedModel && requestedModel.includes(':')) {
                const parts = requestedModel.split(':');
                if (parts.length > 1 && parts[1] !== 'latest') {
                    targetFamily = parts[1];
                }
            }

            // Select Copilot model using VS Code's official API
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: targetFamily
            });

            // If specific model not found, try without family filter
            if (models.length === 0) {
                const allModels = await vscode.lm.selectChatModels({
                    vendor: 'copilot'
                });
                
                if (allModels.length === 0) {
                    throw new Error('No Copilot models available. Please ensure GitHub Copilot is authenticated in VS Code.');
                }
                
                // Use the first available model
                models.push(allModels[0]);
                this.outputChannel.appendLine(`⚠️ Requested model family '${targetFamily}' not found, using '${allModels[0].family}' instead`);
            }

            const model = models[0];
            this.outputChannel.appendLine(`🤖 Using model: ${model.family} (${model.name})`);

            // Create messages using VS Code's API
            const messages = [
                vscode.LanguageModelChatMessage.User(prompt)
            ];

            // Send request using official VS Code Language Model API
            const request = await model.sendRequest(
                messages,
                {},
                new vscode.CancellationTokenSource().token
            );

            // Collect the streaming response
            let response = '';
            for await (const fragment of request.text) {
                response += fragment;
            }

            return response || 'No response generated';

        } catch (error) {
            if (error instanceof vscode.LanguageModelError) {
                throw new Error(`Copilot Error (${error.code}): ${error.message}`);
            }
            throw error;
        }
    }

    private convertChatToPrompt(messages: Array<{ role: string; content: string }>): string {
        return messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n') + '\nassistant: ';
    }

    private convertOpenAIMessagesToPrompt(messages: Array<{ role: string; content: string | Array<{ type: string; text: string }> }>): string {
        return messages
            .map(msg => {
                let content = '';
                if (typeof msg.content === 'string') {
                    content = msg.content;
                } else if (Array.isArray(msg.content)) {
                    // Handle complex content with text and potentially other types
                    content = msg.content
                        .filter(item => item.type === 'text')
                        .map(item => item.text)
                        .join(' ');
                }
                return `${msg.role}: ${content}`;
            })
            .join('\n') + '\nassistant: ';
    }

    private readRequestBody(req: http.IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body);
            });
            req.on('error', reject);
        });
    }

    dispose() {
        this.stop();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}

let bridge: CopilotOllamaBridge;

export function activate(context: vscode.ExtensionContext) {
    bridge = new CopilotOllamaBridge();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-bridge.start', () => bridge.start()),
        vscode.commands.registerCommand('copilot-bridge.stop', () => bridge.stop()),
        vscode.commands.registerCommand('copilot-bridge.restart', () => bridge.restart())
    );

    // Auto-start if configured
    const config = vscode.workspace.getConfiguration('copilot-bridge');
    if (config.get('autoStart', true)) {
        bridge.start();
    }

    context.subscriptions.push(bridge);
}

export function deactivate() {
    bridge?.dispose();
}
