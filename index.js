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
    //console.log('Ran createResultsListItemString function.')
    console.log(resultObject.Name);

    // Create the string that works for both Alibris and IndieBound searches
    const searchUrlTargetString = resultObject.Name.replace(/ /g, '+');

    // Do the NYTimes Books API call to get relevant reviews
    const nyTimesReviewInfo = getNyTimesReviewInfo(resultObject.Name);


    return `
        <li>${resultObject.Name}
            <ul>
                <li>Teaser here.</li>
                <li>Wikipedia link here.</li>
                <li>NYTimes book review link here.</li>
                <li>Search for used books <a href='https://www.alibris.com/booksearch?mtype=B&keyword=${searchUrlTargetString}' target='_blank'>here</a>.</li>
                <li>Search for books available at local bookstores <a href='https://www.indiebound.org/search/book?keys=${searchUrlTargetString}' target='_blank'>here</a>.</li>
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

    $('.results').removeClass('hidden');
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

    // console.log(queryParams.requestedReferences);

    // Add the primary search terms.
    for (let i=0 ; i<queryParams.requestedReferences.length ; i++) {
        queryString += queryParams.requestedReferences[i].replace(/ /g, '+')+'%2C';
        //console.log(queryString);
    }

    queryString = queryString.slice(0,-3); //remove the final %2C
    // console.log(queryString);

    // Add the info parameter to get verbose responses
    queryString += '&info=1';

    // Add the always-present type, callback (to get JSONP response), and key.
    //queryString += '&type=book'
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
function getNyTimesReviewInfo(queryTerm) {
    console.log('Ran getNyTimesReviewInfo function.')
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
function TBD() {

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
}


$(handleLookupPage)