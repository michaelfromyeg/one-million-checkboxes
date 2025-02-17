/**
 * Creating a million checkboxes in a Notion database.
 *
 * Not because I should, but because I _can_.
 *
 * Resources:
 * - Create a database endpoint (notion.databases.create(): https://developers.notion.com/reference/create-a-database)
 * - Working with databases guide: https://developers.notion.com/docs/working-with-databases
 *
 * Adapted from {@link https://github.com/makenotion/notion-sdk-js/blob/main/examples/intro-to-notion-api/intermediate/2-add-page-to-database.js}
 */
const { Client } = require("@notionhq/client");

require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const PAGE_ID = process.env.NOTION_PAGE_ID;

// Use the snippet below to check the bot is registered to the workspace; name is 'One Million Checkboxes'
// Beyond this, make *sure* to share the page `PAGE_ID` with the connection (top-right, three dots, add connection)

// ;(async () => {
//   const listUsersResponse = await notion.users.list({})
//   console.log({ results: listUsersResponse.results })
// })()

// a bit "hard-coded" to work with 100 x 10,000(= 1,000,000) currently
const N_PROPERTIES = 100;
const N_ROWS = 1_000_000 / N_PROPERTIES;

function pad(num, length) {
  return num.toString().padStart(length, "0");
}

async function addNotionPageToDatabase(databaseId, pageProperties) {
  await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: pageProperties,
  });
}

async function main() {
  const properties = Array.from({ length: N_PROPERTIES }).reduce(
    (acc, _, i) => {
      acc[pad(i + 1, 4)] = {
        id: `column-${i + 1}`,
        name: "",
        type: "checkbox",
        checkbox: {},
      };
      return acc;
    },
    {},
  );

  const checkboxesDatabase = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: PAGE_ID,
    },
    title: [
      {
        type: "text",
        text: {
          content: "One Million Checkboxes",
        },
      },
    ],
    properties: {
      // don't overwrite this row! Notion database pages *need* a title
      Row: {
        id: "column-id",
        name: "Row",
        type: "title",
        title: {},
      },
      ...properties,
    },
  });

  const databaseId = checkboxesDatabase.id;

  // if there is no ID (if there's an error), return; else log
  if (!databaseId) {
    console.error("Couldn't create the database... ❎");
    return;
  } else {
    console.log("Done making the database... ✅");
  }

  const row = Array.from({ length: N_PROPERTIES }).reduce((acc, _, i) => {
    acc[pad(i + 1, 4)] = {
      checkbox: false,
    };
    return acc;
  }, {});

  console.log(`Adding ${N_ROWS} new pages...`);
  for (let i = 0; i < N_ROWS; i++) {
    await addNotionPageToDatabase(databaseId, row);
    console.log(`...created page ${i + 1}/${N_ROWS}`);
  }

  console.log("✅✅✅ Done! ✅✅✅");
}

main();
