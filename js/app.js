
var $ = require('jquery');
var makeBackgroundGrey = require('./background');

$(document).ready(() => {
    makeBackgroundGrey();
});

$(document).ready(() => {	
	$('.unanswered-getter').submit((e) => {
		e.preventDefault();
		//<--* zero out results if previous search has run *-->
		$('.results').html('');
		//<--* get the value of the tags the user submitted *-->
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
		document.getElementById("inputTag").value = ""
	});
	

	$('.inspiration-getter').submit((e) => {
		e.preventDefault();
		//<--* zero out results if previous search has run *-->
		$('.results').html('');
		//<--* get the value of the tags the user submitted *-->
		var tags = $(this).find("input[name='answerers']").val();
		getInspiration(tags);
		document.getElementById("inputTag2").value = ""
	});

});


//<--* this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM *-->
var showQuestion = (question) => {
	
	//<--* clone our result template code *-->
	var result = $('.templates .question').clone();
	
	//<--* Set the question properties in result *-->
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	//<--* set the date asked property in result *-->
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	//<--* set the .viewed for question property in result *-->
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	//<--* set some properties related to asker *-->
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=https://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


//<--* this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM *-->
var showSearchResults = (query, resultNum) => {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

//<--* takes error string and turns it into displayable DOM element
var showError = (error) => {
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};



//<--* this function takes the answerer object returned by the StackOverflow request
// and returns new result to be appended to DOM *-->
var showAnswerer = (answerer) => {
	
	//<--* clone our result template code *-->
	var result2 = $('.templates .answerer').clone();
	
	//<--* Set the name of the answerer properties in result *-->
	var nameAnswerer = result2.find('.user a');
	nameAnswerer.attr('href', answerer.user.link);
	nameAnswerer.text(answerer.user.display_name);
	
	// <--* Set the profile image of the answerer in result *-->
	var nameAnswerer = result2.find('.profile_pic img');
	nameAnswerer.attr('src', answerer.user.profile_image);
	
	//<--* Set the reputation score for answerer property in result *-->
	var reputation = result2.find('.reputation');
	reputation.text(answerer.user.reputation);

	//<--* set the user type for answerers property in result *-->
	var userType = result2.find('.user_type');
	userType.text(answerer.user.user_type);

	//<--* set acceptance rate properties related to answerer *-->
	var acceptanceRate = result2.find('.acceptance_rate');
	acceptanceRate.text(answerer.user.accept_rate)

	//<--*  Set the score for answerer *-->
	var answererScore = result2.find('.score');
	answererScore.text(answerer.score)

	return result2;
};


//<--* takes a string of semi-colon separated tags to be searched 
// for on StackOverflow *-->
var getUnanswered = (tags) => {

	//<--* the parameters we need to pass in our request to StackOverflow's API *-->
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "https://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//<--* use jsonp to avoid cross origin issues *-->
		type: "POST",
	})

	.done((result) => { //<--* this waits for the ajax to return with a succesful promise object *-->
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		
		//<--* $.each is a higher order function. It takes an array and a function as an argument. *-->
		//The function is executed once for each item in the array.
		$.each(result.items, (i, item) => {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	
	.fail(function(jqXHR, error){ //<--* this waits for the ajax to return with an error promise object *-->
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getInspiration = (tags) => {
	//<--* the parameters we need to pass in our request to StackOverflow's API *-->
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};

	$.ajax({
		//<--* url changes from format in unanswered questions. Had to add +tags+ as requested by the API documentation. It is also different because it is not requesting data, instead we are sending data. *-->
		url: "https://api.stackexchange.com/2.2/tags/"+tags+"/top-answerers/all_time?site=stackoverflow",
		dataType: "jsonp",//<--* use jsonp to avoid cross origin issues *-->
		type: "GET",
	})

	.done((result) => { //<--* this waits for the ajax to return with a succesful promise object *-->
		// console.log("YISS",result)
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		
		//<--* $.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array. *-->
		$.each(result.items, (i, item) => {
			var answerers = showAnswerer(item);
			$('.results').append(answerers);
		});
	})
	.fail((jqXHR, error) => { //<--* this waits for the ajax to return with an error promise object *-->
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};









