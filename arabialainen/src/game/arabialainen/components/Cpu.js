import React, { Component } from 'react'
import '../styles/theme/light/Cpu.css'

class Cpu extends Component {
  render() {
    const {
      spinAmount,
      spinVisibility
    } = this.props
    return (
      <div className='Cpu'>
        <div className="Cpu-loader"
          style={{
            animationIterationCount: spinAmount,
            visibility: spinVisibility
          }}
        >
          cpu
        </div>
      </div>
    )
  }
}

export default Cpu
