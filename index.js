const async = require('async'); // Searches through the users to find the one with enough credit
const request = require('request'); // Does the HTTP requests
const fs = require('fs'); // For reading the audio file
const args = require('minimist')(process.argv.slice(2)); // To get the audiofile name and title
const open = require('opn'); // Open status page after uploading


//Get the list of username and passwords
const accounts = require('./auth.js');

/**
 * Cycles through all the users and sorts them by credit and returns
 * the one with the most credit.
 * 
 * Returns a promise which resolves to an object.
 */
function getUser() {
  function iterate({username, password, preset}, callback) {
    const auth = new Buffer(`${username}:${password}`).toString('base64');

    request({
      url: 'https://auphonic.com/api/user.json',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    }, (err, res, body) => {
        if(! err) {
          // This object is returned
          callback(null, {
            auth: auth,
            preset: preset,
            credits: JSON.parse(body).data.credits 
          });
        }
    });
  }

  return new Promise( (resolve, reject) => {
    async.map(accounts, iterate, (err, results) => {
      console.log('User selected.')
      if (err) {
        reject(err)
      };
      
      resolve(
        results.sort( (a, b) => a.credits < b.credits )[0]
      );
    });
  });
}


/**
 * Sends the file to Auphonic for processing.
 * @param {Object} { auth: Base64 String, preset: String }
 * @param {String} filepath 
 * @param {String} title 
 */
function createProduction({ auth, preset }, filepath, title) {
  console.log('Starting production and uploading file');

  const formData = {
    preset: preset,
    title: title,
    action: 'start',
    input_file: fs.createReadStream(filepath)
  };

  return new Promise( (resolve, reject) => {

    request.post({
      url: 'https://auphonic.com/api/simple/productions.json',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      formData: formData
    }, (err, res, body) => {
      if (err) {
        reject(err);
      }
      
      console.log('Upload finished. Producting ongoing.')
      resolve(body);
    });

  });
}


if ((args.f == undefined || args.n == undefined) && ! args.h) {
  throw new Error('Run with a file and title');
} else if (args.h) {
  console.log('Reference file with -f and title with -n.');
  console.log('Example: -f audio.mp3 -n "Ep. 003 - Mary Jane on Node.JS"');
} else {
  const filename = require('path').resolve(process.cwd(), args.f);

  getUser()
    .then( user => createProduction(user, filename, args.n) )
    .then( res => open(JSON.parse(res).data.status_page, { wait: false }) );
}
