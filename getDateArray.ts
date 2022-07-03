import axios from "axios";
import { PrismaClient } from "@prisma/client";

interface fetchedData {
  name: string;
  date_added: string;
  quote: {
    USD: {
      price: number;
    };
  };
}

interface fetchedDataArray {
  coin_name: string;
  first_appeared: Date | string;
  price: Array<{ date: Date; price: number }>;
  last_appeared: string | Date | null;
}

// https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=2022-02-07&limit=5000&start=1

const prisma = new PrismaClient();

const main = async () => {
  console.time("fetch");
  let date: string | number = new Date("2013-04-29").toLocaleDateString(
    "en-CA"
  );
  const stopDate = new Date().getTime();
  let START = 1;
  let LIMIT_MAX = 5000;
  let fetchedLength = 0;

  const results: Array<fetchedDataArray> = [];
  let counter = 0;
  let dateArray = []

  while (new Date(date).getTime() <= stopDate) {

    //format the date to replace all - with _
    let formattedDate = date.toString().replace(/-/g, "_");

    // push each date into date array

    dateArray.push(`Date_${formattedDate} Float?`)


    if (fetchedLength === LIMIT_MAX) {
      START += 5000;
      console.log(
        `${date} reached the limit of ${LIMIT_MAX} coins, increasing the start value`
      );
    } else {
      date = new Date(date).setDate(new Date(date).getDate() + 7);
      date = new Date(date).toLocaleDateString("en-CA");
      START = 1;
    }
  }

  console.log(
    `fetched from ${new Date(date).toLocaleDateString("en-CA")} to ${new Date(
      stopDate
    ).toLocaleDateString("en-CA")}`
  );
    console.log(`${dateArray.length} dates fetched`)
   dateArray.map(i => console.log(i))
  console.timeEnd("fetch");
};

main()
