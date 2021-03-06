import React, { Component } from 'react';

export class KeySignatureOptions extends Component{
  constructor(props) {
    super(props)
    this.state={
      nSharpsFlats: [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7],
      majorKeys: ['Fb', 'Cb', 'Gb', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'],
      minorKeys: ['Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#']
    }
  }
  keySignatureChange = (e) => {
    this.props.keySignatureChange(e.target.value);
    // When I pick a key, I want it to change the # of sharps/flats automatically
    const key = e.target.value.split(' ');
    const index = (key[1] === "major") ? this.state.majorKeys.indexOf(key[0]) : this.state.minorKeys.indexOf(key[0])
    this.props.nSharpsFlatsChange(this.state.nSharpsFlats[index])
  }
  nSharpsFlatsChange = (e) => {this.props.nSharpsFlatsChange(e.target.value)}
  
  render() {
    const nSharpFlatsOptions = this.state.nSharpsFlats.map( (num) => {
      return (
        <option value={num} key={num}>
          {(num === 0) ? '0 sharps/flats' : (num < 0) ? Math.abs(num)+' flats' : num + ' sharps'} 
        </option>
      )
    })
    const majorOptions = this.state.majorKeys.map( (key) => {
      return (
        <option value={key + ' major'} key={key}>
          {key + ' major'}
        </option>
      )
    })
    const minorOptions = this.state.minorKeys.map( (key) => {
      return(
        <option value={key + ' minor'} key={key}>
          {key + ' minor'}
        </option>
      )
    })
    return (
      <div id="keySignatureOptions">
        <b>Key Signature</b> <br />
        [Feature Under Construction!] <br />
        [Only C Major For Now!] <br />
        <select value={this.props.nSharpsFlats} onChange={this.nSharpsFlatsChange}>
          {nSharpFlatsOptions}
        </select>
        <select value={this.props.keySignature} onChange={this.keySignatureChange}>
          {majorOptions}
          {minorOptions}
        </select>
      </div>
    )
  }
}