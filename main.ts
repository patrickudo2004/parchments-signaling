/**
 * Deno Signaling Server for Yjs WebRTC
 * Optimized for Deno Deploy
 */

const topics = new Map<string, Set<WebSocket>>();

function send(conn: WebSocket, message: any) {
    if (conn.readyState !== WebSocket.OPEN) {
        conn.close();
        return;
    }
    try {
        conn.send(JSON.stringify(message));
    } catch (_e) {
        conn.close();
    }
}

function handleConnection(conn: WebSocket) {
    const subscribedTopics = new Set<string>();

    conn.onmessage = (event) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(event.data);
        } catch (_e) {
            return;
        }

        if (parsedMessage && parsedMessage.type) {
            switch (parsedMessage.type) {
                case "subscribe":
                    (parsedMessage.topics || []).forEach((topicName: string) => {
                        if (typeof topicName === "string") {
                            let topic = topics.get(topicName);
                            if (!topic) {
                                topic = new Set();
                                topics.set(topicName, topic);
                            }
                            topic.add(conn);
                            subscribedTopics.add(topicName);
                        }
                    });
                    break;
                case "unsubscribe":
                    (parsedMessage.topics || []).forEach((topicName: string) => {
                        const topic = topics.get(topicName);
                        if (topic) {
                            topic.delete(conn);
                            if (topic.size === 0) {
                                topics.delete(topicName);
                            }
                        }
                        subscribedTopics.delete(topicName);
                    });
                    break;
                case "publish":
                    if (parsedMessage.topic) {
                        const receivers = topics.get(parsedMessage.topic);
                        if (receivers) {
                            receivers.forEach((receiver) => {
                                if (receiver !== conn) {
                                    send(receiver, parsedMessage);
                                }
                            });
                        }
                    }
                    break;
                case "ping":
                    send(conn, { type: "pong" });
                    break;
            }
        }
    };

    conn.onclose = () => {
        subscribedTopics.forEach((topicName) => {
            const topic = topics.get(topicName);
            if (topic) {
                topic.delete(conn);
                if (topic.size === 0) {
                    topics.delete(topicName);
                }
            }
        });
        subscribedTopics.clear();
    };

    conn.onerror = () => {
        conn.close();
    };
}

Deno.serve((req) => {
    if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        handleConnection(socket);
        return response;
    }
    return new Response("Parchments Deno Signaling Server is running.", { status: 200 });
});
