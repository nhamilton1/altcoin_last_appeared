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
  let bitcoinCounter = 0;
  let requestCounterWithBTC = 0;

  while (new Date(date).getTime() <= stopDate) {

    try {
      const url = `https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=${date}&limit=5000&start=${START}`;
      console.log("fetching date: ", date);
      const response = await axios.get(url);
      fetchedLength = response.data.data.length;
      response.data.data.map((i: fetchedData) => {
        // push only unqiue coins to the results array
        if (!results.find((j) => j.coin_name === i.name)) {
          results.push({
            coin_name: i.name,
            first_appeared: new Date(i.date_added),
            price: [
              {
                date: new Date(i.date_added),
                price: i.quote.USD.price,
              },
            ],
            last_appeared: null,
          });
        }

        if (i.name === "Bitcoin" && START === 1) {
            bitcoinCounter++;
            console.log('amount of times bitcoin appeared:',bitcoinCounter);
        }

      });
    } catch (err) {
      console.log(err);
    }

    counter++;
    console.log(`${counter} requests made`);
    console.log(`${fetchedLength} coins fetched`);

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
  console.log('amount of times bitcoin appeared:',bitcoinCounter);
  console.log(
    `fetched from ${new Date(date).toLocaleDateString("en-CA")} to ${new Date(
      stopDate
    ).toLocaleDateString("en-CA")}`
  );
  console.timeEnd("fetch");
};

main()
