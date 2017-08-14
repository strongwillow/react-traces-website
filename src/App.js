import React, { Component } from 'react';
import Menu from './menu.js';
import CKComponent from './Cloud.js';
import DetailSidebar from './DetailSidebar.js';
import {Map} from './Map.js';

const google = window.google;

export class MarkerType {
    static get red() { return 0; }
    static get green() { return 1; }
    
    static get new() { return -1; }
    static get searchHit() { return -2; }
    static get wiki() { return -3; }
    static get googlePlace() { return -4; }
}

/* marker model is used to display anything marker on the map. */
function createMarker(lat, lng, type, data) {

    const position = new google.maps.LatLng(
	lat, lng
    );

    return {
	position,
	showInfo: false,
	type: type,
	data: data
    };
}

class App extends Component {

    state = {
	markers: [],
	showContextMenu: false,
	showDetailSidebar: false,
	rightClickPosition: {left: 100, top: 100}
    }

    handleMapMounted = this.handleMapMounted.bind(this);
    handleMarkerClick = this.handleMarkerClick.bind(this);
    handleMapRightClick = this.handleMapRightClick.bind(this);
    handleMapLeftClick = this.handleMapLeftClick.bind(this);
    handleStarsLoad = this.handleStarsLoad.bind(this);
    handleAddStar = this.handleAddStar.bind(this);
    handleStarSaved = this.handleStarSaved.bind(this);
    handleStarRecordCreated = this.handleStarRecordCreated.bind(this);
    handleStarRecordRemoved = this.handleStarRecordRemoved.bind(this);    
    
    componentDidMount() {
	this._ck.loadStars();	
    }

    handleStarRecordRemoved(re) {
	var markers = this.state.markers.filter(e => e != this.state.selectedStar);
	this.setState({
	    markers: markers,
	    showDetailSidebar: false
	});
    }
    
    handleStarsLoad(re) {

	var markers = this.state.markers;

	for (var it in re) {

	    var fields = re[it].fields;
	    
	    var marker = createMarker(fields.location.value.latitude, fields.location.value.longitude, fields.type.value, re[it]);
	    
	    markers.push(marker);	    
	}

	this.setState({
	    markers: markers
	});

    }
    
    handleMapLeftClick(e) {

	if (e.placeId) {
	    var newStar = this.createNewStar(e.placeId, {lat: e.latLng.lat(), lng: e.latLng.lng()}, MarkerType.googlePlace);

	    this.setState({
		selectedStar: newStar,
		showDetailSidebar: true,
		showContextMenu: false
	    });
	    
	}
	else {
	    this.setState({
		showDetailSidebar: false,
		showContextMenu: false
	    });
	}
	
    }

    handleMapRightClick(e) {
	this.setState({
	    showContextMenu: true,
	    rightClickPosition: {left: e.pixel.x, top: e.pixel.y},
	    rightClickEvent: e
	});	
    }

    handleMapMounted(map) {
	console.log(map);
	window.map = map;

	var input = document.getElementById('searchTextField');
	var searchBox = new google.maps.places.SearchBox(input);
	var options = {
	    types: ['(regions)']
	};

	var _this = this;
	
	searchBox.addListener('places_changed', function() {
	    var places = searchBox.getPlaces();

	    if (places.length == 0) {
		return;
	    }

	    var markers = [];
	    for (var it in _this.state.markers) {
		if (_this.state.markers[it].type != MarkerType.searchHit) {
		    markers.push(_this.state.markers[it]);
		}
	    }

	    var bounds = new google.maps.LatLngBounds();
	    places.forEach(function(place) {
		if (!place.geometry) {
		    console.log("Returned place contains no geometry");
		    return;
		}		
		
		var icon = {
		    url: place.icon,
		    size: new google.maps.Size(71, 71),
		    origin: new google.maps.Point(0, 0),
		    anchor: new google.maps.Point(17, 34),
		    scaledSize: new google.maps.Size(25, 25)
		};

		// Create a marker for each place.

		var marker = createMarker(place.geometry.location.lat(), place.geometry.location.lng(), MarkerType.searchHit);
		markers.push(marker);
		
		_this.setState({
		    markers: markers
		});

		if (place.geometry.viewport) {
		    // Only geocodes have viewport.
		    bounds.union(place.geometry.viewport);
		} else {
		    bounds.extend(place.geometry.location);
		}
	    });
	    map.fitBounds(bounds);
	});
    }

    /** star model is used to render detailsidebar */
    createNewStar(title, coords, type, url, note) {
	return {
	    title: title,
	    coords: coords,
	    type: type,
	    url: url,
	    note: note
	};
    }
    
    handleAddStar() {

	let loc = this.state.rightClickEvent.latLng;
	var markers = this.state.markers;
	markers.push(createMarker(loc.lat(), loc.lng(), MarkerType.new));

	var newStar = this.createNewStar("Untitled", {lat: loc.lat(), lng: loc.lng()}, MarkerType.new, "", "");

	this.setState({
	    markers: markers,
	    showContextMenu: false,
	    selectedStar: newStar,
	    showDetailSidebar: true	    
	});
	
    }

    handleMarkerClick(targetMarker) {
	this.setState({
	    selectedStar: targetMarker,
	    showDetailSidebar: true
	});
    }

    handleStarSaved() {
/*	var markers = this.state.markers.filter(x => x.type != MarkerType.new);
	this.setState({markers: markers});*/
    }

    handleStarRecordCreated(e) {
	
	var markers = this.state.markers.filter(it => it.type != MarkerType.new);
	var fields = e.fields;

	var marker = createMarker(fields.location.value.latitude, fields.location.value.longitude, parseInt(fields.type.value), e);
	
	markers.push(marker);
	let star = this.createNewStar(fields.title.value, {lat: fields.location.value.latitude, lng: fields.location.value.longitude}, fields.type.value, fields.url.value, fields.note.value);
	star.isNewStar = false;
	    
	this.setState({
	    markers: markers,
	    selectedStar: star
	});
	
    }
    
    render() {
	return (
	    <div className='full-height'>

	      <Menu active={this.state.showContextMenu} position={this.state.rightClickPosition} onAddStar={this.handleAddStar} />
	      
		<CKComponent ref={(ck) => {this._ck = ck;}} onStarsLoad={this.handleStarsLoad} onStarRecordCreated={this.handleStarRecordCreated} onStarRemoved={this.handleStarRecordRemoved}/>

	      {
		  this.state.showDetailSidebar && (
		      <DetailSidebar star={this.state.selectedStar} ck={this._ck} onStarSaved={this.handleStarSaved} />
		  )
	      }	      

	      <input type="text" id="searchTextField" className='searchBar' />
	      
	      <Map
		markers={this.state.markers}
		onMarkerClick={this.handleMarkerClick}
		onMapMounted={this.handleMapMounted}
		onMapLeftClick={this.handleMapLeftClick}
		onMapRightClick={this.handleMapRightClick}
		containerElement={
			<div style={{ height: `100%` }} className='container' />
			}
			mapElement={
				<div style={{ height: `100%` }} />
				}
				/>
	    </div>

	);
    }

}

export default App;
