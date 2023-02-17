/**
 * Node Script: CSV to JSON and back.
 * ------------------------------------------------------------------------------
 * A boilerplate for parsing and modifying CSV data.
 *
 * - Parses a CSV file that you input
 * - Modifies the CSV to a JSON object
 * - You run ES6 functions to modify data
 * - Output modified object to a new CSV file
 *
 * Modify to suit your needs.
 */

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const fs = require('fs');

const inputCsvJson = [];
let modifiedCsvJson = [];

/**
 * Global config.
 */
const config = {
  inputFile: './input/questions.csv',
  outputFile: './output/date-format-questions.csv',
};

/**
 * CSV configuration - more found in csvWriter docs.
 *
 * id: Title of the column from the input CSV
 * title: title of column in output, where input data will be mapped to.
 *
 * Each header ID needs to match the CSV header title text and can be reordered.
 */

//id,product_id,body,date_written,asker_name,asker_email,reported,helpful
const csvWriter = createCsvWriter({
  path: config.outputFile,
  header: [
    {
      id: 'id',
      title: 'id'
    },
    {
      id: 'product_id',
      title: 'product_id'
    },
    {
      id: 'body',
      title: 'body'
    },
    {
      id: 'date_written',
      title: 'date_written'
    },
    {
      id: 'asker_name',
      title: 'asker_name'
    },
    {
      id: 'asker_email',
      title: 'asker_email'
    },
    {
      id: 'reported',
      title: 'reported'
    },
    {
      id: 'helpful',
      title: 'helpful'
    },
  ],
  alwaysQuote: true,
});

/**
 * Initialise script.
 */
function init() {
  console.log('Initiating...');
  console.log(`Preparing to parse CSV file... ${config.inputFile}`);

  fs.createReadStream(config.inputFile)
    .pipe(csv())
    .on('data', (data) => inputCsvJson.push(data))
    .on('end', () => {
      modifiedCsvJson = inputCsvJson

      console.log('...Done');

      initFunctions();
    });
}

/**
 * Execute functions once data is available.
 */
function initFunctions() {
  console.log('Initiating script functionality...');

  dateToTimestamptz('date_written')
  /**
   * Once everything is finished, write to file.
   */
  writeDataToFile();
}



/**
 * Removes the parenthesis from the 'Certified Units' field.
 */
function dateToTimestamptz(columnName) {
  console.log('Changing unix to timestamptz');

  modifiedCsvJson = modifiedCsvJson.map((item) => {
    const returnedItem = item
    const itemKey = columnName
    returnedItem[itemKey] = new Date(parseInt(item[itemKey])).toISOString();

    return returnedItem
  })

  console.log('...Done');
}


/**
 * Write all modified data to its own CSV file.
 */
async function writeDataToFile() {
  console.log(`Writing data to a file...`);

  const frag = 10000;

  const partition = Math.ceil(modifiedCsvJson.length/frag);
  for(let i = 0; i < partition; i++){
    console.log('writing...', i*frag, 'to',i*frag + frag)
    await csvWriter.writeRecords(modifiedCsvJson.slice(i*frag, i*frag + frag))
  }

}

init();
