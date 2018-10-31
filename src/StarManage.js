import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';

class Table extends React.Component {

    constructor(props) {
	super(props);
    }

    delete(rn, title) {
	console.log(this.props);
	this.props.onDelete(rn, title);
    }
    
    render() {
	return (<table className="activity-table">
		<tbody>
		<tr>
		<th>Path</th>
		<th width="200">Title</th>
		<th width="200">Date</th>
		<th width="200">Coordinate</th>
		</tr>
		
		{this.props.stars.map((row) =>
				       
				       <tr key={row.recordName}>
				       <td>{row.type}</td>
				       <td>{row.title}</td>
				       <td>{row.datetime}</td>
				       <td>{row.coordinate}</td>
				       <td><button record={row.recordName} onClick={this.delete.bind(this, row.recordName, row.title)}>Delete</button></td>
				       </tr>
				       
				      )}
		</tbody>
		</table>
	       );
    }
}

class StarManage extends React.Component {

    constructor(props) {
	super(props);
	this.state = {stars: []};
    }

    onDelete = this.onDelete.bind(this);
    onDelete (recordName, title) {
	var _this = this;
	if (window.confirm("You're going to delete trace: \n" + title)) {
	    _this.ck.removeRecord(recordName, function(p) {
		console.log("done", p);

		_this.traces = [];
		_this.ck.loadTracesOrderByDate(null, _this.renderRecords);

	    });
	}
    }
    
    renderRecords = this.renderRecords.bind(this);
    renderRecords(records) {

	console.log(records);

	for (var i in records) {

	    let date = new Date(records[i].created.timestamp);
	    
	    this.stars.push({title: records[i].fields.title.value,
			     type: records[i].fields.type.value,
			     recordName: records[i].recordName,
			     datetime: formatDate(date),
			     coordinate: records[i].fields.location.value.latitude + ", " + records[i].fields.location.value.longitude
			});
	}		

	this.setState({stars: this.stars});

    };
    
    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleLoginSuccess() {
	if (window.userIdentity) {

	    this.stars = [];	    
	    this.ck.loadStarsOrderByDate(null, this.renderRecords);
	}	
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
	    this.ck.loadTracesOrderByDateNext(this.renderRecords);
    }

    removeDuplis = this.removeDuplis.bind(this);
    removeDuplis() {
	var _this = this;
	this.ck.loadTracesOrderByDateNext(function(records) {

	    document.body.scrollTop = document.body.scrollHeight;
	    _this.renderRecords(records);

	}, true, function() {

	    var m = {};
	    var traces = _this.state.traces;
	    for (var i in traces) {
		if (m[traces[i].path] == null) {
		    m[traces[i].path] = [traces[i]];
		}
		else {
		    m[traces[i].path].push(traces[i]);
		}
	    }

	    if (window.confirm("You have " + Object.keys(m).length + " unique Traces. Found " + (traces.length - Object.keys(m).length) + " duplicates. Are you sure to remove them?")) {

		var count = 0;
		Object.keys(m).forEach(function(key) {

		    for (var i = 0; i < m[key].length - 1; i++) {
			count ++;
			setTimeout(function(){

			    return function(k) {

				_this.ck.removeRecord(m[key][k].recordName, function(p) {
				    console.log("done", p);
				});
			    }(i);

			}, 600 * count);
		    }
		});

	    }
	});
    }

    
    render() {
	return (
		<div className='default'>

		<CKComponent ref={(_ck) => {this.ck = _ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='stars' />

		<Table onDelete={this.onDelete} stars={this.state.stars}/>

	    <center>
		<button className="btn btn-primary" onClick={this.loadMore}>Load More</button>
		   
		<button className="btn btn-danger" onClick={this.removeDuplis}>Remove Duplicates</button>
		</center>
		
		<SiteFooter />
		</div>
	);
    }
}


export default StarManage;