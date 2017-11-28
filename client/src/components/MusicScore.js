// Component to display the music score.
// Role: ONLY to render the music score based on props passed down from App. It doesn't do any calculations whatsoever.
import React, { Component } from 'react';
import { Accidental } from 'vexflow/src/accidental';
import { Stave } from 'vexflow/src/stave';
import { StaveNote } from 'vexflow/src/stavenote';
import { Voice } from 'vexflow/src/voice';
import { Formatter } from 'vexflow/src/formatter';
import { Renderer } from 'vexflow/src/renderer';
import { Beam } from 'vexflow/src/beam';

class MusicScore extends Component {
  constructor(props) {
    super(props);
    this.generateMusicScore = this.generateMusicScore.bind(this);
    this.constructContext = this.constructContext.bind(this);
  }

  constructContext() {
    const div = document.getElementById("musicScore");
    let renderer = new Renderer(div, 3);
    renderer.resize(800,500);
    return renderer.getContext();
  }

  generateMusicScore() {    
    let context = this.constructContext();
    // Construct stave
    let stave = new Stave(10, 40, 400);
    const timeSignature = this.props.nBeats.toString() + "/" + this.props.beatValue.toString();
    stave.addClef(this.props.clef).addTimeSignature(timeSignature);
    stave.setContext(context).draw();
    // Construct notes array
    const noteSequence = this.props.noteSequence;
    const rhythmSequence = this.props.rhythmSequence;
    let notes = [];
    for(let n = 0; n < this.props.nPitches; n++){
      notes.push(new StaveNote({
        clef: this.props.clef,
        keys: [noteSequence[n]],
        duration: rhythmSequence[n].toString()       
      }));
    }
    // Create a voice in 4/4 and add notes
    const voice = new Voice({
      num_beats: this.props.nBeats, 
      beat_value:this.props.beatValue
    }).addTickables(notes);
    // Automatically generate beams
    const beams = Beam.generateBeams(notes);
    // Render voices
    const formatter = new Formatter().joinVoices([voice]).format([voice], 400);
    Formatter.FormatAndDraw(context, stave, notes)
    voice.draw(context, stave);
    // Draw beams
    beams.forEach(function(b) {b.setContext(context).draw()});
  }

  componentWillUpdate() {
    // Before re-rendering a new score, remove all instances of old score by removing all child nodes. 
    const musicScoreDiv = document.getElementById("musicScore");
    while(musicScoreDiv.firstChild) {
      musicScoreDiv.removeChild(musicScoreDiv.firstChild);
    }
  }

  componentDidMount() {
    this.generateMusicScore();
  }

  // Invoked immediately after updating occurs.
  // Meant for updating the score, since we can only attach the score when the DOM has re-rendered.
  componentDidUpdate() {
    this.generateMusicScore();
  }

  render() {
    return(
      <div id="musicScore">
      </div>
    )
  }
}

export default MusicScore;