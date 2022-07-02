import axios from 'axios'

interface fetchedData {
    name: string,
    date_added: string,
    quote: {
        USD: {
            price: number
        }
    }
}

interface fetchedDataArray {
    name: string,
    first_appeared: string,
    price: number,
    last_appeared: string | number | null
}

// https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=2022-05-01&limit=5000&start=20000

const main = async () => {
    console.time('fetch')
    let date: string | number = new Date("2013-04-29").toLocaleDateString('en-CA')
    const stopDate = new Date("2014-04-29").getTime()
    const url = `https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=${date}&limit=5000`


    const data: Array<fetchedDataArray> = []
    let counter = 0

    while (new Date(date).getTime() <= stopDate) {
        // sleep for 1 seconds before making the next api request
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
            const response = await axios.get(url)
            response.data.data.map((i: fetchedData) => {
                const res = {
                    name: i.name,
                    first_appeared: i.date_added,
                    price: i.quote.USD.price,
                    last_appeared: null
                }

                //if the coin is not in the response, it means it was removed from the market, so we want to update the last_appeared in the data array
                if (!response.data.data.find((j: fetchedData) => j.name === i.name)) {
                    console.log(`${i.name} was removed from the market`)
                    const index = data.findIndex(j => j.name === i.name)
                    data[index].last_appeared = date
                }


                console.log(res)
                data.push(res)
            })

        } catch (err) {
            console.log(err)
        }


        counter++
        console.log(`${counter} requests made`)
        date = new Date(date).setDate(new Date(date).getDate() + 7);
        date = new Date(date).toLocaleDateString('en-CA')
    }

    console.log(data.length)

    // finds all counts that have last_appeared not null
    const count = data.filter((i: fetchedDataArray) => i.last_appeared !== null).length
    console.log('number of none null last appeared value', count)
    console.timeEnd('fetch')






}

main()
