import React, { Component } from 'react';
import {MarkerType} from './App.js';
import {LiveMarkedArea} from './LiveMarkedArea.js';
import {formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';

const google = window.google;


class TraceSidebar extends Component {

    constructor(props) {
	super(props);

	this.ck = props.ck;
	var state = this.convertProps2State(props);
	state.editMode = false;
	
	this.state = state;
	this.trace = null;
    }

    convertProps2State(props) {
	let data = props.trace;

	if (data) {

	    if (this.lastTraceRN == data.recordName) {
		return {};
	    }
	    this.lastTraceRN = data.recordName;	    

	    this.loadTrace(data);
	    
	    return {
		recordName: data.recordName,
		title: '',
		distance: '',
		averageSpeed: '',
		duration: '',
		type: data.type,
		startDate: '',
		note: '',
		elevation: '',
		lastUpdate: '',
		sharedBy: (data.share ? "Shared by " + this.ck.getUserNameByRecordName(data.share.zoneID.ownerRecordName) : 'Share')

	    };

	}
	
	return {
	    note: ""
	};
    }

    enterEditMode = this.enterEditMode.bind(this);
    enterEditMode() {
	this.setState({editMode: true});
    }

    save = this.save.bind(this);
    save() {
	var trace = {};
	var _this = this;
	trace.fields = {};
	trace.recordName = this.state.recordName;
	trace.recordType = "Trace";
	trace.fields.type = this.state.type;
	trace.fields.title = this.state.title;
	trace.fields.note = this.state.note;
	this.ck.saveRecord(trace, function (re) {
	    console.log(re);
	    _this.setState({editMode: false});	    
	});
    }

    cancel = this.cancel.bind(this);
    cancel() {
	this.setState({editMode: false});
    }


    noteChange = this.noteChange.bind(this);
    noteChange(e) {
	console.log(e);
	this.setState({
	    note: e.target.value
	});
    }

    titleChange = this.titleChange.bind(this);    
    titleChange(e) {
	this.setState({
	    title: e.target.value
	});
    }

    share = this.share.bind(this);
    share(){
	this.ck.shareWithUI(this.trace, function(response){
	    
	});
    }    

    loadTrace = this.loadTrace.bind(this);    
    loadTrace(trace) {

	let _this = this;

	this.ck.loadRecord(trace.recordName, trace.share, function(re) {

	    let data = re.fields;

	    _this.trace = re;

	    let date = new Date(data.startDate.value + data.secondsFromGMT.value * 1000);

	    var states = {
		title: data.title.value,
		distance: formatDistance(data.distance.value),
		averageSpeed: formatSpeed(data.averageSpeed.value),
		duration: formatDuration(data.duration.value),
		startDate: formatDate(date),
		note: data.note.value ? data.note.value : '',
		elevation: data.elevation.value,
		type: data.type.value,
		linkingId: data.linkingId.value,
		lastUpdate: new Date(re.modified.timestamp).toLocaleString()
		
	    };
	    _this.setState(states);
	});	

    }

    componentWillReceiveProps(props) {
	this.setState(this.convertProps2State(props));
    }

    render() {
	return (
	    <div className='sidebar-right'>
	      { this.state.sharedBy && (
	    	  <div className='star-type'>

		  </div>
	      )}
		  
		  <div className='controls'>
		    { !this.state.editMode ?
			(<button onClick={this.enterEditMode}>Edit</button>):
		      (
			  <div>
			    <button onClick={this.cancel}>Cancel</button>
			    <button onClick={this.save}>Save</button>
			  </div>
		      )
		    }
		</div>
		<h1 className='name'>
		{ !this.state.editMode ?
		  this.state.title :
		  (<input type='text' placeholder='Name' defaultValue={this.state.title} onChange={this.titleChange} />)
		}

		</h1>
		<table className='infoBox'>
		<tbody>

		<tr>
		<td className='td-trace'>Local Date Time</td><td>{this.state.startDate}</td>
		</tr>

		<tr>
		<td className='td-trace'>Distance</td><td>{this.state.distance}</td>
		</tr>

		<tr>
		<td className='td-trace'>Average Speed</td><td>{this.state.averageSpeed}</td>
		</tr>
		<tr>
		<td className='td-trace'>Elevation</td><td>{this.state.elevation}</td>
		</tr>
		<tr>
		<td className='td-trace'>Duration</td><td>{this.state.duration}</td>
		</tr>
		<tr>
		<td className='td-trace'>Last update</td><td>{this.state.lastUpdate}</td>
		</tr>

		</tbody>
		</table>
		<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note}  value={this.state.note} onChange={this.noteChange}/>

		</div>
	      );
	}

    }

    export default TraceSidebar;
