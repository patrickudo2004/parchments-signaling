#!/usr/bin/env node

const ws = require('ws')
const http = require('http')
const map = require('lib0/map')

const wsServer = new ws.Server({ noServer: true })

const port = process.env.PORT || 4444

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('Parchments Private Signaling Server is running.\n')
})

/**
 * @type {Map<string, Set<any>>}
 */
const topics = new Map()

const send = (conn, message) => {
    if (conn.readyState !== ws.OPEN) {
        conn.close()
    }
    try {
        conn.send(JSON.stringify(message))
    } catch (e) {
        conn.close()
    }
}

const onconnection = conn => {
    /**
     * @type {Set<string>}
     */
    const subscribedTopics = new Set()
    conn.on('message', message => {
        let parsedMessage
        try {
            parsedMessage = JSON.parse(message)
        } catch (e) {
            return
        }
        if (parsedMessage && parsedMessage.type) {
            switch (parsedMessage.type) {
                case 'subscribe':
                    ; (parsedMessage.topics || []).forEach(topicName => {
                        if (typeof topicName === 'string') {
                            const topic = map.setIfUndefined(topics, topicName, () => new Set())
                            topic.add(conn)
                            subscribedTopics.add(topicName)
                        }
                    })
                    break
                case 'unsubscribe':
                    ; (parsedMessage.topics || []).forEach(topicName => {
                        const topic = topics.get(topicName)
                        if (topic) {
                            topic.delete(conn)
                            if (topic.size === 0) {
                                topics.delete(topicName)
                            }
                        }
                        subscribedTopics.delete(topicName)
                    })
                    break
                case 'publish':
                    if (parsedMessage.topic) {
                        const receivers = topics.get(parsedMessage.topic)
                        if (receivers) {
                            receivers.forEach(receiver => {
                                if (receiver !== conn) {
                                    send(receiver, parsedMessage)
                                }
                            })
                        }
                    }
                    break
                case 'ping':
                    send(conn, { type: 'pong' })
                    break
            }
        }
    })
    conn.on('close', () => {
        subscribedTopics.forEach(topicName => {
            const topic = topics.get(topicName)
            if (topic) {
                topic.delete(conn)
                if (topic.size === 0) {
                    topics.delete(topicName)
                }
            }
        })
        subscribedTopics.clear()
    })
}

wsServer.on('connection', onconnection)

server.on('upgrade', (request, socket, head) => {
    // You can add authentication here if needed
    const handleAuth = () => {
        wsServer.handleUpgrade(request, socket, head, ws => {
            wsServer.emit('connection', ws, request)
        })
    }
    handleAuth()
})

server.listen(port, () => {
    console.log(`Signaling server running on port ${port}`)
})
