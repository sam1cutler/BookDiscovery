'use strict';

/********** Define strings for the APIs **********/

// TasteDive API.
const apiKey = '391102-BookReco-Z2ZG9UZJ';
const baseEndpoint = 'https://tastedive.com/api/similar?';

// NYTimes API


// OpenLibrary API


/********** TEMPLATE GENERATION FUNCTIONS **********/

// Create the HTML string for each item in the results list
function createResultsListItemString(resultObject) {

    // Create a shorthand name replacing spaces with plus signs
    const resultHitShorthand = resultObject.Name.replace(/ /g, '+');

    // TO-DO: need to incorporate the type (author or book) into the button value to make the NYTimes API call work.

    return `
        <li>${resultObject.Name}
            <ul>
                <li>${resultObject.wTeaser}</li>
                <li><a href='${resultObject.wURL}'>Click here for the full Wikipedia page</a>.</li>
                <li><button type="button" class='js-book-review-button' value='${resultHitShorthand}'>Click here to find a relevant New York Times book review.</button></li>
                <li>Shope for used books <a href='https://www.alibris.com/booksearch?mtype=B&keyword=${resultHitShorthand}' target='_blank'>here</a>.</li>
                <li>Shop for books at local bookstores <a href='https://www.indiebound.org/search/book?keys=${resultHitShorthand}' target='_blank'>here</a>.</li>
            </ul>
        </li>`;
}


/********** RENDER FUNCTIONS **********/

// Create Results List + insert into the DOM.
function displayGoodResults(resultsArray) {
    console.log('Ran displayGoodResults function.');

    let resultsListHtmlString = '';

    for (let i=0 ; i<resultsArray.length ; i++) {
        resultsListHtmlString += createResultsListItemString(resultsArray[i]);
    };

    $('.js-results-list').append(resultsListHtmlString);

    $('.results-section').removeClass('hidden');
}


// Logic to determine how to handle the TasteDive search results
function handleResults(responseJson) {
    console.log('Ran handleResults function.');
    console.log(responseJson);

    if (responseJson.Similar.Results.length === 0) {
        console.log('Did not get any search results.');
        $('.js-error-message').html('<hr>This search did not get any results. Please try again. Tips etc.');
        //$('.js-error-message').removeClass('hidden');
    } else {
        console.log('Got search results!');
        $('.js-error-message').empty();
        displayGoodResults(responseJson.Similar.Results);
    }

}

/********** API REQUEST STRING GENERATION FUNCTIONS **********/

// Create the query string for the GET request.

function formatQueryParams(queryParams) {
    console.log('Ran formatQueryParams function.')

    // Initialize empty start to queryString.
    let queryString = 'q=';

    // Add the primary search terms.
    for (let i=0 ; i<queryParams.requestedReferences.length ; i++) {
        queryString += queryParams.requestedReferences[i].replace(/ /g, '%20')+'%2C';
    }

    queryString = queryString.slice(0,-3); //remove the final %2C

    // Add the info parameter to get verbose responses
    queryString += '&info=1';

    // Add the always-present type, callback (to get JSONP response), and key.
    queryString += '&type=author'
    queryString += '&callback'
    queryString += queryParams.key

    return queryString;
}

/********** API REQUEST FUNCTIONS **********/

// Submit the core TasteDive API GET request.
function getRecommendations(requestedReferencesArray) {
    console.log('Ran getRecommendations function.');

    const params = {
        key: apiKey,
        requestedReferences: requestedReferencesArray,
    };

    const queryString = formatQueryParams(params);
    const URLtoBeFetched = baseEndpoint+queryString;
    console.log(URLtoBeFetched);

    fetchJsonp(URLtoBeFetched)
        .then(response => {
            if (response.ok) {
                return response.json();
                //console.log(response.json());
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => handleResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

// Submit the NYTimes Books API GET request.
function fetchNyTimesReviews(queryTerm) {
    console.log('Ran fetchNyTimesReviews function.')
    console.log(queryTerm);
}

// Submit the Open Library API GET request.
function getNyTimesReviewInfo(queryTerm) {
    console.log('Ran getNyTimesReviewInfo function.')
}


/********** EVENT HANDLER FUNCTIONS **********/

// Set up event listener on Submission Form
function watchSubmissionForm() {
    console.log('Ran watchForm function.');

    $('main').on('submit','.submission-form', function(event) {
        event.preventDefault();
        console.log('The submission form was submitted.');

        // Store data from form submission in an array.
        let requestArray = [];
        
        // *** note: eventually want a more elegant / generalized solution to "how many references did user submit?"
        for (let i=1 ; i<4 ; i++) {
            if ( $(`#js-search-field${i}`).val() != '' ) {
                requestArray.push( $(`#js-search-field${i}`).val().toLowerCase() );
            }
        }
        
        console.log('The user has requested recommendations based on:');
        console.log(requestArray);

        getRecommendations(requestArray);
        
    })


}

// Set up event listener on "Show Reviews" button
function watchNyTimesReviewsRequest() {
    console.log('Ran watchNyTimesReviewsRequest function.')
    $('.results-section').on('click','.js-book-review-button', function(event) {
        event.preventDefault();
        console.log('User requested NY Times reviews.');
        const requestedFeature = $(this).val();
        fetchNyTimesReviews(requestedFeature);
    })
}

// Set up event listener on Reset Form
function TBD() {

}

// Set up event listener on Tweak Same Search Form
function TBD() {

}

// Run the event-listener-setup function
function handleLookupPage() {
    console.log('Ran handleLookupPage function.');
    watchSubmissionForm();
    watchNyTimesReviewsRequest();

}


$(handleLookupPage)