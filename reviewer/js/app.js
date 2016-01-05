Parse.initialize('EJEoxMi9zbyn43dsCmAcXjrZq5oW6gNtgCJTng2n', '3d5qyd2jVCAiaIle41UaSxx3MQ1NkzJvc7oClRGE');

// function to make sure the appropriate user is logged in. If none, then
// an anonymous user will be logged in
function testlogin() {
	Parse.User.logOut();
	Parse.User.logIn('Anonymous', 'none', {
		error: function(temp, error) {
			$('#parse-error').text(error.message).show();
			Parse.User.signUp('Anonymous', 'none', null, {
				error: showError
			}); 
		}
	})

   preventPost();
}

// upon ready, the modal is shown as well as the raty star is initialized
$(document).ready(function() {
	testlogin();
	$('#loading').modal('show');
	$('#login').modal('show');
	$('#star').raty({starType: 'i', score: 1});

	populateReviews();
});

// function to make one review given all the raw data as parameters.
// formats the data into the nice block that is put on the page
var makeReview = function(objectID, title, user, rating, body, up, down) {
	var div = $('<div/>', {class: 'review-box container'}).appendTo('#review-list');
	var row = $('<div/>', {class: 'row row-body'}).appendTo(div);
	var colL = $('<div/>', {class: 'col-xs-11 col-sm-10'}).appendTo(row);
	$('<h2/>', {
		text: title
	}).appendTo(colL);
	$('<h5/>', {
		text: 'Written by ' + user
	}).appendTo(colL);
	var star = $('<div/>', {class: 'review-star'});
	star.raty({starType: 'i'});
	star.raty('score', rating);
	star.find('i').unbind();
	star.appendTo(colL);
	$('<h6/>', {
		text: up + ' Like, ' + down + ' Dislike'
	}).appendTo(colL);
	$('<p/>', {
		text: body
	}).appendTo(colL);
	var colR = $('<div/>', {class: 'col-xs-1 col-sm-2'}).appendTo(row);
	var rowR = $('<div/>', {class: 'row'}).appendTo(colR);
	var colRSubL = $('<div/>', {class: 'col-xs-12 col-sm-4'}).appendTo(rowR);
	$('<i/>', {class: 'tup fa fa-thumbs-up', 'data-objectid': objectID}).appendTo(colRSubL);
	var colRSubM = $('<div/>', {class: 'col-xs-12 col-sm-4'}).appendTo(rowR);
	$('<i/>', {class: 'tdn fa fa-thumbs-down', 'data-objectid': objectID}).appendTo(colRSubM);
	var colRSubR = $('<div/>', {class: 'col-xs-12 col-sm-4'}).appendTo(rowR);
	$('<i/>', {class: 'trash fa fa-trash', 'data-objectid': objectID}).appendTo(colRSubR);
}

// function used to fetch the reviews from the server and populate the list on the page
var populateReviews = function() {
	var total = 0;
	var number = 0;
	var query = new Parse.Query('Review');
	query.each(function(review) {
		makeReview(
			review.id,
			review.get('title'),
			review.get('user'),
			review.get('rating'),
			review.get('body'),
			review.get('up'),
			review.get('down')
		);
		number++;
		total += review.get('rating');
	}).then(function() {
		var star = $('#average');
		star.raty({starType: 'i'});
		star.raty('score', Math.round(total/number));
		star.find('i').unbind();
		$('#loading').modal('hide');
	});
}

// click funtion for the thumbs up button for each review. Updates the server
// accordingly atomically
$(document).on('click', '.tup', function(e) {
	$('#loading').modal('show');
	var id = $(e.target).data('objectid');
	var query = new Parse.Query('Review');
	var review;
	query.get(id, {
		success: function(obj) {
			review = obj;
		}
	}).then(function() {
		review.increment('up');
		review.save({
			error: showError
		});
		$(e.target).closest('.review-box').find('h6').text(review.get('up') + ' Like, ' + review.get('down') + ' Dislike');
		$('#loading').modal('hide');
	});
});

// click funtion for the thumbs down button for each review. Updates the server
// accordingly atomically
$(document).on('click', '.tdn', function(e) {
	$('#loading').modal('show');
	var id = $(e.target).data('objectid');
	var query = new Parse.Query('Review');
	var review;
	query.get(id, {
		success: function(obj) {
			review = obj;
		}
	}).then(function() {
		review.increment('down');
		review.save({
			error: showError
		});
		$(e.target).closest('.review-box').find('h6').text(review.get('up') + ' Like, ' + review.get('down') + ' Dislike');
		$('#loading').modal('hide');
	});
});

// click funtion for the delete button for each review.
$(document).on('click', '.trash', function(e) {
	$('#loading').modal('show');
	var id = $(e.target).data('objectid');
	var query = new Parse.Query('Review');
	var review;
	query.get(id, {
		success: function(obj) {
			review = obj;
		}, error: function(temp, error) {
			$('#parse-error').text(error.message).show();
		}
	}).then(function() {
		review.destroy({
			success: function() {
				$('#loading').modal('hide');
			},
			error: function() {
				showError()
				$('#loading').modal('hide');
			}
		});
	}).then(function() {
		$(e.target).closest('.review-box').remove();
	});
});

// submit function for each user login event. User is verified and notified of the login status.
$('#login-form').on('submit', function(event) {
	var name = $('#login-username').val();
	$('#loading').modal('show');
	Parse.User.logIn(name, $('#login-password').val(), {
		success: function(user) {
			$('#loading').modal('hide');
			$('#login .error').toggleClass('alert-danger', false).toggleClass('alert-success').text('Logged in as: ' + name).show();
			setTimeout(function() {
				$('#login').modal('hide');
			}, 2000);			
		},
		error: function(user, error) {
			$('#loading').modal('hide');
			$("#login .error").toggleClass('alert-danger', true).text("Invalid username or password. Please try again.").show();
		}
	}); 

   preventPost();
});

// sign up function for the user sign up event. User is checked to not be a duplicate and
// is then notified of the sign up status.
$('#signup-form').on('submit', function(event) {
	var name =  $('#signup-username').val();
	var user = new Parse.User();
	user.set("username", name);
	user.set("password", $('#signup-password').val());
	$('#loading').modal('show');
	user.signUp(null, {
		success: function(user) {
			$('#loading').modal('hide');
			$('#login .error').toggleClass('alert-danger', false).toggleClass('alert-success').text('Signed up as: ' + name).show();
			setTimeout(function() {
				$('#login').modal('hide');
			}, 2000);
		},
		error: function(user, error) {
			$('#loading').modal('hide');
			$("#login .error").toggleClass('alert-danger', true).text(error.message).show();
		}
	});

	preventPost();
});

// submit function for each new review. Sends the data up to server and then populates new
// review dynamically without a page refresh.
$('#review-form').on('submit', function(event) {
	$('#loading').modal('show');
	var review = new Parse.Object('Review');
	review.set(
		{
			'rating': Number($('#star').raty('score')),
			'title': $('#review-title').val(),
			'body': $('#review-body').val(),
			'user': Parse.User.current().getUsername(),
			'up': 0,
			'down': 0
		});
	review.save(null,
		{
			error: showError
		}
	).then(function() {
			makeReview(
				review.id,
				review.get('title'),
				review.get('user'),
				review.get('rating'),
				review.get('body'),
				0,
				0
			);
		}
	);

	$('#review-form').each(function() {
		this.reset();
	});
	$('#star').raty('score', 1);
	$('#loading').modal('hide');
	preventPost();
});

// reveals the error message in the error box at the top of the screen
// with the given error message.
var showError = function(obj, error) {
	$('#parse-error').text(error.message).show();
}

// function to prevent data being sent out to the server.
var preventPost = function() {
	event.preventDefault();
	event.returnValue = false;
	return false;
}