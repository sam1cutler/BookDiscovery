'use strict';

// Define the API keys.
const apiKey = '391102-BookReco-Z2ZG9UZJ';

// Define the base endpoint.
const baseEndpoint = 'https://tastedive.com/api/similar?';


// Create the HTML string for each item in the results list
function createResultsListItemString(resultObject) {
    //console.log('Ran createResultsListItemString function.')
    console.log(resultObject.Name);

    const searchUrlTargetString = resultObject.Name.replace(/ /g, '+');

    return `
        <li>${resultObject.Name}
            <ul>
                <li>Teaser here.</li>
                <li>Search for used books <a href='https://www.alibris.com/booksearch?mtype=B&keyword=${searchUrlTargetString}' target='_blank'>here</a>.</li>
                <li>Search for books available at local bookstores <a href='https://www.indiebound.org/search/book?keys=${searchUrlTargetString}' target='_blank'>here</a>.</li>
            </ul>
        </li>`;
}


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



// Logic to determine how to handle the search results
function handleResults(responseJson) {
    console.log('Ran handleResults function.');
    console.log(responseJson);

    // if don't get any results
    if (responseJson.Similar.Results.length === 0) {
        console.log('Did not get any search results. Need to update an error message element.');
    } else {
        console.log('Got search results!');
        displayGoodResults(responseJson.Similar.Results);
    }

    // if do get search results
}



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

// Submit the core GET request.
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

// Run the event-listener-setup function
function handleLookupPage() {
    console.log('Ran handleLookupPage function.');
    watchSubmissionForm();
}


$(handleLookupPage)