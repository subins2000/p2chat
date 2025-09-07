import React, { useState, useRef, useEffect } from 'react'
import P2PT from 'p2pt'

function App() {
  const [joined, setJoined] = useState(false)
  const [room, setRoom] = useState('general')
  const [username, setUsername] = useState('')
  const [members, setMembers] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('')
  const [peers, setPeers] = useState({})
  const [usernames, setUsernames] = useState({})

  const chatWrapperRef = useRef(null)
  const messageInputFieldRef = useRef(null)
  const p2ptRef = useRef(null)

  const init = () => {
    setPeers({})

    let announceURLs = [
      "wss://tracker.openwebtorrent.com",
      "wss://tracker.btorrent.xyz",
      "wss://tracker.webtorrent.dev",
    ]
    if (window.location.hostname === "localhost") {
      // announceURLs = ["ws://localhost:5000"]
    }

    p2ptRef.current = new P2PT(announceURLs, 'p2chat' + room)
  }

  const joinChat = () => {
    if (room.trim() === '' || username.trim() === '') {
      return
    }

    init()
    setJoined(true)
    setStatus(`${username} joined the chat`)
    setUsernames({})

    listen()

    // Focus the message input field
    setTimeout(() => {
      if (messageInputFieldRef.current) {
        messageInputFieldRef.current.focus()
      }
    }, 0)
  }

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      return
    }

    const message = {
      username: username,
      message: newMessage
    }

    // Clear input field
    setNewMessage('')

    for (var key in peers) {
      p2ptRef.current.send(peers[key], JSON.stringify(message))
    }

    setMessages(prev => [...prev, message])
    scrollDown()
  }

  const listen = () => {
    p2ptRef.current.on('peerconnect', (peer) => {
      setPeers(prev => ({ ...prev, [peer.id]: peer }))
    })

    p2ptRef.current.on('peerclose', (peer) => {
      setPeers(prev => {
        const newPeers = { ...prev }
        delete newPeers[peer.id]
        return newPeers
      })
      setMembers(prev => {
        const newMembers = { ...prev }
        delete newMembers[peer.id]
        return newMembers
      })
    })

    p2ptRef.current.on('msg', (peer, msg) => {
      msg = JSON.parse(msg)
      
      setMembers(prev => ({ ...prev, [peer.id]: msg.username }))
      setMessages(prev => [...prev, {
        username: msg.username,
        message: msg.message
      }])
      scrollDown()
    })
    p2ptRef.current.start()
  }

  const scrollDown = () => {
    setTimeout(() => {
      if (chatWrapperRef.current) {
        const elem = chatWrapperRef.current
        elem.scrollTop = elem.clientHeight + elem.scrollHeight
      }
    }, 0)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (joined) {
        sendMessage()
      } else {
        joinChat()
      }
    }
  }

  return (
    <div className="container">
      <div id="app" className="row">
        <div className="col-xl-8 col-lg-12 col-md-6 col-sm-12 col-12">
          <div className="panel panel-info">
            <div className="panel-heading">
              <span className="badge">{Object.keys(members).length}</span> Members
            </div>
            <div className="panel-body">
              {joined ? (
                <div>
                  <em><span>{status}</span></em>
                  <div className="chat-wrapper" ref={chatWrapperRef}>
                    <ul className="chat">
                      {messages.map((message, index) => (
                        <li key={index} className="left clearfix">
                          <div className="chat-body clearfix">
                            <div className="header">
                              <strong className="primary-font">
                                {message.username}
                              </strong>
                            </div>
                            <p>
                              {message.message}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="panel-footer">
                    <div className="input-group">
                      <input 
                        id="btn-input" 
                        type="text" 
                        name="message" 
                        className="form-control input-sm" 
                        placeholder="Type your message here..." 
                        value={newMessage}
                        ref={messageInputFieldRef}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyUp={handleKeyPress}
                      />
                      
                      <span className="input-group-btn">
                        <button 
                          className="btn btn-primary btn-sm" 
                          id="btn-chat" 
                          onClick={sendMessage}
                        >
                          Send
                        </button>
                      </span>
                    </div>
                    <br/>
                    <div className="input-group">
                      Members : 
                      {Object.values(members).map((member, index) => (
                        <span key={index}><b>{member}</b>, </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label>Room Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="chat room name" 
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      onKeyUp={handleKeyPress}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="enter your username to join chat" 
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyUp={handleKeyPress}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={joinChat}>
                    JOIN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
