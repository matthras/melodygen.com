import React, { Component } from 'react';
import './App.css';
import './skeleton.css';
import Header from './components/Header.js';
import Options from './components/Options.js';
import MusicScore from './components/MusicScore.js';

class App extends Component {
  constructor(props) {
    super(props) 
    this.state = {
      // Stuff that happens at the start of a score.
      anacrusis: false,
      clef: "treble",
      nBeats: 4, // Time signature
      beatValue: 4, // Time signature
      // Library of Constants - None of these should ever change from the initial setup.
      majorScaleIntervals: [2, 2, 1, 2, 2, 2, 1],
      minorScaleIntervals: [2, 1, 2, 2, 1, 2, 1],
      pitchClasses: ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#','b'],
      fullPitchRange: [], // Generated in componentwillmount()
      noteLengthClasses: [1, 2, 4, 8, 16], // Whole note, minim, crotchet, quaver, semiquaver.
      // Initial Conditions
      workingPitchRange: ['c/4','d/4','e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'],
      keySignature: 'C major',
      nSharpsFlats: 0,
      markovChain: [
        [0.2, 0.3, 0.3, 0, 0.2, 0, 0, 0],
        [0.25, 0.25, 0.25, 0.25, 0, 0, 0, 0],
        [0.2, 0.2, 0.2, 0.2, 0.2, 0, 0, 0],
        [0, 0.2, 0.2, 0.2, 0.2, 0.2, 0, 0],
        [0, 0, 0.2, 0.2, 0.2, 0.2, 0.2, 0],
        [0, 0, 0, 0.2, 0.2, 0.2, 0.2, 0.2],
        [0, 0, 0, 0, 0.25, 0.25, 0.25, 0.25],
        [0, 0, 0, 0.25, 0, 0.25, 0.25, 0.25],
      ],
      noteSequence: [['c/4','d/4','e/4','f/4'],['g/4', 'a/4', 'b/4', 'c/5'],['c/5', 'b/4', 'a/4', 'g/4'],['f/4','e/4','d/4','c/4']],
      rhythmSequence: [[4, 4, 4, 4],[4,4,4,4],[4,4,4,4],[4,4,4,4]],
      nBars: 4,
      renderNewScore: true
    }
  }
  // Takes a sharpened or flattened note, and returns the enharmonic equivalent.
  enharmonicEquivalent = (note) => {
    const splitNote = note.split('');
    const accidental = (splitNote[1]==='#') ? 'b' : '#';
    let newNote = (splitNote[1]==='#') ? splitNote[0].charCodeAt(0)+1 : splitNote[0].charCodeAt(0)-1;
    if(newNote < 97){
      newNote+= 7
    } else if (newNote > 103){
      newNote-= 7
    }
    return String.fromCharCode(newNote)+accidental;
  }
  preventRendering = () => {this.setState({renderNewScore: false})}
  nBarsChange = (nBars) => {this.setState({nBars})}
  nBeatsChange = (nBeats) => {this.setState({nBeats})}
  beatValueChange = (beatValue) => {this.setState({beatValue})}
  workingPitchRangeChange = (workingPitchRange) => {this.setState({workingPitchRange})}
  keySignatureChange = (keySignature) => {this.setState({keySignature})}
  nSharpsFlatsChange = (nSharpsFlats) => {this.setState({nSharpsFlats})}
  markovchainChange = (row, rowIndex) => {
    let markovChain = this.state.markovChain;
    markovChain[rowIndex] = row;
    this.setState({markovChain});
  }

  startingPitch = () => {
    // Random roll for anacrusis. Maybe aim for 0.25 chance for an anacrusis?
    // If there is to be an anacrusis, return the dominant; else return the tonic.
    // Need to verify music theory concerning other possible anacrusis notes.
    return this.state.anacrusis ? 'g/4' : 'c/4'
  }

  getNextPitch = (currentPitch) => {
    var markovChainRow = this.state.markovChain[currentPitch];
    var diceRoll = Math.random();
    var probabilityUpperBound = markovChainRow[0];
    for(var i = 0; i < markovChainRow.length; i++) {
        if(diceRoll <= probabilityUpperBound) {
            return i; // Return a number or the next pitch?
        } else {
            probabilityUpperBound += markovChainRow[i+1]
        }
    }
    return "Error" // How to do error handling here?
  }

  // Generates a new rhythm - at the moment it's designed to have one element per beat, so combinations such as quaver-quaver, or 4 semiquavers, are all contained within subarrays. One flattened array per bar.
  generateRhythmSequence = () => {
    let newRhythmSequence = [];
    for(let bar = 0; bar < this.state.nBars; bar++){
      let rhythmBar = [];
      for(let b = 0; b < this.state.nBeats; b++){
        rhythmBar.push( Math.random()> 0.25 ? 4 : [8, 8])
      }
      newRhythmSequence.push([].concat(...rhythmBar));
    }
    return newRhythmSequence;
  }

  generateNewScore = () => {
    // Before re-rendering a new score, remove all instances of old score by removing all child nodes. 
    const musicScoreDiv = document.getElementById("musicScore");
    while(musicScoreDiv.firstChild) {
      musicScoreDiv.removeChild(musicScoreDiv.firstChild);
    }
    // Generating New Score
    let newRhythmSequence = this.generateRhythmSequence();
    let newNoteSequence = [];
    let currentPitch = 0; // Dependent on result of startingPitch() which is currently the tonic.
    for(let bar = 0; bar < this.state.nBars; bar++) {
      let notesBar = [];
      for(let r = 0; r < newRhythmSequence[bar].length; r++) {
        if(bar===0){
          notesBar.push(this.startingPitch());
        }
        currentPitch = this.getNextPitch(currentPitch);
        notesBar.push(this.state.workingPitchRange[currentPitch]);
      }
      newNoteSequence.push(notesBar);
    }
    this.setState({
      noteSequence: newNoteSequence, 
      rhythmSequence: newRhythmSequence,
      renderNewScore: true
    });
  }

  render() {
    return (
      <div className="App container">
          <Header />
          <button onClick={this.generateNewScore}>
            Generate Music!
          </button>
          <MusicScore
            clef={this.state.clef}
            nBars={this.state.nBars} 
            nBeats={this.state.nBeats}
            beatValue={this.state.beatValue}
            noteSequence={this.state.noteSequence}
            rhythmSequence={this.state.rhythmSequence}
            renderNewScore={this.state.renderNewScore}
            preventRendering={this.preventRendering}
          />
          <Options  
            clef={this.state.clef}
            nBars={this.state.nBars}
            markovChain={this.state.markovChain}
            nBeats={this.state.nBeats}
            beatValue={this.state.beatValue}
            nBarsChange={this.nBarsChange}
            nBeatsChange={this.nBeatsChange}
            beatValueChange={this.beatValueChange}
            markovchainChange={this.markovchainChange}
            workingPitchRangeChange={this.workingPitchRangeChange}
            keySignatures={this.state.keySignatures}
            fullPitchRange={this.state.fullPitchRange}
            workingPitchRange={this.state.workingPitchRange}
            keySignature={this.state.keySignature}
            keySignatureChange={this.keySignatureChange}
            nSharpsFlats={this.state.nSharpsFlats}
            nSharpsFlatsChange={this.nSharpsFlatsChange}
          />
      </div>
    );
  }
}

export default App;