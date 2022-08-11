import React, { Component } from 'react'
import '../styles/theme/light/Message.css'

class Message extends Component {
  render() {
    const { message } = this.props
    return (
      <div className='Message'>
        <p>{message}</p>
      </div>
    )
  }
}

export default Message