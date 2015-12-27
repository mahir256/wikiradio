var defaultList = 'classic';
var audioPlayer = document.getElementById('audioPlayer');
var audioDescription = document.getElementById('audioDescription');
var audioPlayerAux = document.getElementById('audioPlayerAux');
var listening = document.getElementById('listening');

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null)
       return null;
    
    return results[1] || 0;
}

var getList = ($.urlParam('getList') == null) ? (defaultList) : $.urlParam('getList');

$.getJSON( "playlist.php", { getList: getList} )
  .done(function( JsonTracks ) {
    
    var totalLength = getTotalDuration(JsonTracks);
    var diffsec = getDiffsec(totalLength)
    
    playCurrent(diffsec,JsonTracks);
    
  })
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});

function getTotalDuration(JsonTracks)
{
    var totalLength = 0;
    $.each(JsonTracks, function(i, item) {
    	totalLength +=JsonTracks.duration;
    });	
    return totalLength;
}

function getDiffsec(totalLength)
{
	var date = new Date();
	var dateutc = date.toUTCString();
	var data = document.getElementById('data');
	var epoch = Math.round(new Date() / 1000);
	var diffsec = epoch % totalLength;
	return diffsec;
}

function playCurrent(diffsec,JsonTracks) {
	var trackID = 0;
	for (var i=0;i<JsonTracks.length;i++) {
	    trackID = i;
	    if (diffsec <= JsonTracks.duration) {
	        playTrackFrom(trackID,JsonTracks);
	        break;
	    }
	    
	    diffsec -= JsonTracks.duration;
	}
	
	hourlySignal();
}

function playTrack(trackID,JsonTracks){
    audioDescription.innerHTML = '<a href="https://commons.wikimedia.org/wiki/File:' + JsonTracks[trackID].title + '">' + JsonTracks[trackID].title + '</a>';
    //update height description
    listening.style.height = getHeight(listening)+"px"; 
    
    audioPlayer.src = JsonTracks[trackID].url;
    audioPlayer.play();
    audioPlayer.ondurationchange = function() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    }
    audioPlayer.onended = function(){
        if (trackID < JsonTracks.length - 1) {
            trackID++;
        } else {
            trackID = 0;
        }
        playTrack(trackID,JsonTracks);
    }
}

function playTrackFrom(){
    playTrack();
    audioPlayer.ondurationchange = function() {
        audioPlayer.pause();
        audioPlayer.currentTime = diffsec;
        audioPlayer.play();
    }
}

function playHourlySignal(){
    audioPlayerAux.src = 'https://upload.wikimedia.org/wikipedia/commons/2/26/Busy_tone_%28France%29.ogg';
    audioPlayerAux.play();
    setTimeout(hourlySignal, 5000);
}

function hourlySignal(){
    var d = new Date();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    if ((min == '59') && (sec == '59')) {
        playHourlySignal();
    }else{
        setTimeout(playHourlySignal,(60*(59-min)+(59-sec))*1000);
    }
}
//Volume control
volumeslider = document.getElementById("volumeslider");
function setvolume(){
	audioPlayer.volume = volumeslider.value / 100;
}
volumeslider.addEventListener("change",setvolume,false);

function getHeight(oDiv) {
    var sOriginalOverflow = oDiv.style.overflow;
    var sOriginalHeight = oDiv.style.height;
    oDiv.style.overflow = "";
    oDiv.style.height = "";
    var height = oDiv.offsetHeight;
    oDiv.style.height = sOriginalHeight;
    oDiv.style.overflow = sOriginalOverflow;
    return height;
}